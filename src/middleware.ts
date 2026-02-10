import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  validateBearerToken,
  checkRateLimit,
  type GitHubUser,
} from "@/lib/auth-utils";

// --- CORS helpers (from #44) ---

function getAllowedOrigin(requestOrigin: string | null): string | null {
  const env = process.env.NODE_ENV;
  const configuredOrigins = process.env.CORS_ALLOWED_ORIGINS;

  if (env !== "production") {
    return "*";
  }

  if (!configuredOrigins) {
    return null;
  }

  if (configuredOrigins === "*") {
    return "*";
  }

  if (!requestOrigin) {
    return null;
  }

  const origins = configuredOrigins.split(",").map((o) => o.trim());
  if (origins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return null;
}

function setCorsHeaders(
  headers: Headers,
  allowedOrigin: string | null,
): void {
  if (!allowedOrigin) return;

  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS",
  );
  headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization",
  );
  headers.set("Access-Control-Max-Age", "86400");
}

// --- Auth helpers ---

const PUBLIC_PATHS = ["/", "/auth/signin"];
const PROTECTED_PREFIXES = ["/api/presentations", "/api/generate", "/presentation"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/api/auth")) return true;
  return false;
}

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Extract bearer token from Authorization header. */
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1] : null;
}

// --- Combined middleware: CORS -> auth (session OR bearer) -> rate limit -> next ---

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(origin);

  // 1. Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    setCorsHeaders(response.headers, allowedOrigin);
    return response;
  }

  // 2. Check if auth is enabled (AUTH_GITHUB_ID exists)
  const authEnabled = !!process.env.AUTH_GITHUB_ID;
  const { pathname } = request.nextUrl;

  if (authEnabled && !isPublicPath(pathname) && isProtectedPath(pathname)) {
    const { auth } = await import("@/auth");
    const session = await auth();

    // Session wins if present
    let authenticatedUserId: string | null = null;

    if (session?.user?.id) {
      authenticatedUserId = session.user.id;
    } else if (pathname.startsWith("/api/")) {
      // No session - try bearer token on API routes
      const token = extractBearerToken(request);
      if (token) {
        const ghUser: GitHubUser | null = await validateBearerToken(token);
        if (ghUser) {
          authenticatedUserId = ghUser.userId;
        } else {
          const response = NextResponse.json(
            { error: "Invalid or expired token" },
            { status: 401 },
          );
          response.headers.set("WWW-Authenticate", "Bearer");
          setCorsHeaders(response.headers, allowedOrigin);
          return response;
        }
      } else {
        const response = NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
        response.headers.set("WWW-Authenticate", "Bearer");
        setCorsHeaders(response.headers, allowedOrigin);
        return response;
      }
    } else {
      // Non-API protected path - redirect to sign-in
      const signInUrl = new URL("/api/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }

    // 3. Rate limiting
    if (authenticatedUserId) {
      const rateResult = checkRateLimit(authenticatedUserId);
      if (!rateResult.allowed) {
        const response = NextResponse.json(
          { error: "Rate limit exceeded" },
          { status: 429 },
        );
        response.headers.set(
          "Retry-After",
          String(rateResult.retryAfterSeconds),
        );
        setCorsHeaders(response.headers, allowedOrigin);
        return response;
      }
    }
  }

  // 4. Pass through with CORS headers
  const response = NextResponse.next();
  setCorsHeaders(response.headers, allowedOrigin);
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/presentation/:path*"],
};