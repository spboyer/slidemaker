import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin");
  const allowedOrigin = getAllowedOrigin(origin);

  // Handle preflight OPTIONS requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    setCorsHeaders(response.headers, allowedOrigin);
    return response;
  }

  // Add CORS headers to the response
  const response = NextResponse.next();
  setCorsHeaders(response.headers, allowedOrigin);
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
