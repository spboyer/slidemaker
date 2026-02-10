### GitHub OAuth via NextAuth.js (Auth.js v5)
**Author:** McManus (Backend Dev) - **Date:** 2026-02-10 - **Issue:** #41

#### Auth Configuration

- Auth.js v5 (`next-auth@5.0.0-beta.30`) with GitHub OAuth provider
- Config in `src/auth.ts` exports `handlers`, `auth`, `signIn`, `signOut`
- Route handler at `src/app/api/auth/[...nextauth]/route.ts`
- JWT strategy - sessions in encrypted cookies, no database needed
- Auth.js v5 auto-reads `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` env vars

#### Session Data Shape

```typescript
session.user = {
  id: string;        // GitHub user ID
  name: string;      // GitHub display name
  email: string;     // GitHub email
  image: string;     // GitHub avatar URL
  username: string;  // GitHub login (e.g., "spboyer")
}
```

#### Local Dev Bypass

When `AUTH_GITHUB_ID` is not set, middleware skips all auth checks.
`UserMenu` shows "Dev Mode" badge. Detected via `data-auth-enabled` on `<html>`.

#### Middleware

Uses Auth.js v5 `auth()` wrapper with `req.auth`. Matcher: `/api/:path*`, `/presentation/:path*`.

- **Public:** `/`, `/auth/signin`, `/api/auth/*`
- **Protected:** `/api/presentations/*`, `/api/generate/*`, `/presentation/*`
- API routes return 401 JSON; page routes redirect to sign-in

#### Frontend

- `AuthProvider.tsx` wraps `SessionProvider` from `next-auth/react`
- `UserMenu.tsx` - avatar + sign-out / "Sign in with GitHub" / "Dev Mode"
- Added to home page and presentation page headers

#### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `AUTH_GITHUB_ID` | No (enables OAuth) | GitHub OAuth App Client ID |
| `AUTH_GITHUB_SECRET` | With AUTH_GITHUB_ID | OAuth App Client Secret |
| `AUTH_SECRET` | Auto-generated in dev | Session encryption secret |

#### Setup (Manual Step for Shayne)

1. GitHub Settings > Developer settings > OAuth Apps > New OAuth App
2. Application name: SlideMaker
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID -> `AUTH_GITHUB_ID`, generate Client Secret -> `AUTH_GITHUB_SECRET`
6. Add to `.env.local` (gitignored)