import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

// --- Combined middleware: CORS first, then auth ---

export async function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(origin);

  // 1. Handle preflight OPTIONS requests — return 204 with CORS headers
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    setCorsHeaders(response.headers, allowedOrigin);
    return response;
  }

  // 2. Check if auth is enabled (AUTH_GITHUB_ID exists)
  const authEnabled = !!process.env.AUTH_GITHUB_ID;
  const { pathname } = request.nextUrl;

  if (authEnabled && !isPublicPath(pathname) && isProtectedPath(pathname)) {
    // Dynamically import auth to avoid build errors when next-auth is not configured
    const { auth } = await import("@/auth");
    const session = await auth();

    if (!session) {
      if (pathname.startsWith("/api/")) {
        const response = NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 },
        );
        setCorsHeaders(response.headers, allowedOrigin);
        return response;
      }
      const signInUrl = new URL("/api/auth/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signInUrl);
    }
  }

  // 3. Pass through with CORS headers
  const response = NextResponse.next();
  setCorsHeaders(response.headers, allowedOrigin);
  return response;
}

export const config = {
  matcher: ["/api/:path*", "/presentation/:path*"],
};