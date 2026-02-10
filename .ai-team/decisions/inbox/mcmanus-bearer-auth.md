### Bearer Token Authentication for API Clients
**Author:** McManus (Backend Dev) · **Date:** 2026-02-10 · **Issue:** #42

**What:** Added `Authorization: Bearer <github-token>` support for external API clients (MCP server, Copilot Extension) alongside existing OAuth session auth.

#### How Bearer Token Validation Works

1. Middleware flow: CORS -> auth (session OR bearer) -> rate limit -> next.
2. If a NextAuth session exists, it takes priority -- bearer token is not checked.
3. If no session on an API route (`/api/*`), the middleware extracts `Authorization: Bearer <token>` from the request header.
4. The token is validated by calling `GET https://api.github.com/user` with the token. The response provides `id`, `login`, and `avatar_url`.
5. Invalid/expired tokens get `401` with `WWW-Authenticate: Bearer` header. All error responses include CORS headers.
6. Non-API protected routes (e.g. `/presentation/*`) without a session still redirect to sign-in (no bearer support for browser pages).

#### Caching Strategy

- Validated tokens are cached in-memory using a `Map<tokenHash, CachedToken>`.
- Token keys are SHA-256 hashes (`crypto.createHash('sha256')`) -- raw tokens are never stored.
- TTL: 5 minutes. After expiry, the next request re-validates against GitHub.
- A `setInterval` cleanup runs every 60 seconds to evict expired entries (with `.unref()` to avoid blocking Node shutdown).

#### Rate Limiting Behavior

- Fixed-window: 60 requests per 60-second window per user ID.
- Applies to both session-authenticated and bearer-token-authenticated users.
- Exceeded limits return `429` with `Retry-After: <seconds>` header (seconds remaining in window).
- Independent per user -- one user's exhaustion doesn't affect others.

#### Files Changed

- `src/lib/auth-utils.ts` -- New module: `validateBearerToken()`, `checkRateLimit()`, `hashToken()`, token cache, rate limit map.
- `src/middleware.ts` -- Updated to check bearer token when no session, added rate limiting after auth.
- `src/__tests__/auth.test.ts` -- 10 tests: token hashing, validation, caching, rate limiting.

#### How to Test

```bash
# With a valid GitHub token:
curl -H "Authorization: Bearer $(gh auth token)" http://localhost:3000/api/presentations

# Invalid token (expect 401):
curl -H "Authorization: Bearer bad_token" http://localhost:3000/api/presentations

# Rate limit test (expect 429 after 60 requests):
for i in $(seq 1 65); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -H "Authorization: Bearer $(gh auth token)" \
    http://localhost:3000/api/presentations
done
```