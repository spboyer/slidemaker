### CORS Middleware for API Routes
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #44 · **Status:** Implemented

Added `src/middleware.ts` — Next.js middleware that adds CORS headers to all `/api/*` responses, enabling the MCP server and Copilot Extension to call the API from external processes.

#### CORS Configuration

| Header | Value |
|--------|-------|
| `Access-Control-Allow-Origin` | Per-origin (see below) |
| `Access-Control-Allow-Methods` | `GET, POST, PUT, DELETE, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type, Authorization` |
| `Access-Control-Max-Age` | `86400` (24 hours) |

**Origin resolution (`CORS_ALLOWED_ORIGINS` env var):**
- **Development** (`NODE_ENV !== 'production'`): Always `*` — allows all origins for local dev.
- **Production** (`NODE_ENV === 'production'`):
  - If `CORS_ALLOWED_ORIGINS` is not set → no `Access-Control-Allow-Origin` header (deny all cross-origin requests).
  - If set to `*` → allows all origins.
  - If set to a comma-separated list (e.g. `https://app.example.com,https://copilot.example.com`) → only those exact origins are allowed (per-request origin matching).

**Preflight:** `OPTIONS` requests return `204 No Content` with CORS headers — no body, no downstream route handler invocation.

#### Extending for Auth Middleware (Issues #41, #42)

The middleware structure is designed for extension. To add auth checks:

1. CORS runs first (headers must be set even on auth failures for the browser to read the error).
2. After CORS header injection, add auth logic before `NextResponse.next()`:

```ts
// After setCorsHeaders(response.headers, allowedOrigin) for non-OPTIONS:
const authResult = validateAuth(request);
if (!authResult.valid) {
  const errorResponse = NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );
  setCorsHeaders(errorResponse.headers, allowedOrigin);
  return errorResponse;
}
return response;
```

The `setCorsHeaders` helper is already extracted as a reusable function for this purpose.

#### Files Changed
- `src/middleware.ts` (new) — middleware with `config.matcher: ["/api/:path*"]`

**Verified:** Build passes, 50 unit tests pass.
