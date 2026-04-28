# Research: Google SSO Login Page

**Feature**: `001-google-sso-login` | **Date**: 2026-04-28

---

## Decision: OAuth Callback Architecture

**Decision**: Full-page redirect flow where the NestJS backend handles the OAuth code
exchange and then redirects the browser to the frontend callback route with the token in
the URL.

**Rationale**: The backend uses `passport-google-oauth20` (server-side code exchange) and
`GOOGLE_CALLBACK_URL` is the backend URL registered with Google Cloud Console. After
Passport exchanges the code and calls `handleGoogleCallback`, the response must reach the
frontend SPA. Since the current handler returns JSON (not a redirect), the browser ends up
on the raw backend URL — the SPA is no longer loaded.

The correct architecture is: after processing the callback, the backend redirects the
browser to `${FRONTEND_URL}/auth/callback?token=<idToken>&user=<base64User>`. The
frontend `AuthCallbackPage` at `/auth/callback` reads these params, stores the session,
and redirects to the intended destination.

**⚠ Backend Prerequisite (not in scope for this frontend feature)**: The
`handleGoogleCallback` method in `src/modules/auth/auth.controller.ts` must be updated
to redirect to the frontend instead of returning JSON. The frontend origin must be
available in the backend via an env var (e.g., `FRONTEND_URL`). The URL shape:

```
${FRONTEND_URL}/auth/callback?token=<idToken>&user=<base64(JSON.stringify(user))>
```

The `user` value is `base64url(JSON.stringify({ googleId, email, name, picture, createdAt }))`.
This does not leak secrets — the `idToken` is a signed JWT, not a secret.

**Alternatives Considered**:
- Popup window: rejected in spec clarification (user chose full-page redirect).
- Frontend handles code exchange: requires exposing the client secret in the browser —
  rejected on security grounds.
- Frontend polls a session endpoint after redirect: adds unnecessary round-trip and
  requires backend session storage — rejected (backend is stateless).

---

## Decision: Auth State Management

**Decision**: Store the `AuthSession` in `localStorage` under the key `lachiwana_session`
as a JSON string. Expose three functions: `getSession()`, `setSession(session)`,
`clearSession()`.

**Rationale**: `localStorage` survives browser/tab close (confirmed in spec clarification).
The token lifetime (~1 hour) gives a reasonable "stay logged in" UX on mobile. All reads
and writes are synchronous, so no async ceremony is needed for the guard logic.

**Alternatives Considered**:
- `sessionStorage`: cleared on tab close — rejected per clarification.
- In-memory only: lost on page refresh — rejected per clarification.
- Cookie (HttpOnly): would require backend changes; also inapplicable since the token is
  verified client-side at the guard before any request — rejected.

---

## Decision: Token Expiry Detection Strategy

**Decision**: Dual detection — proactive check in `ProtectedRoute` on every route
transition (decode JWT `exp` claim, compare to `Date.now()`), plus reactive handling of
401 responses in the API client.

**Rationale**: Proactive detection prevents a failed API call occurring before the
redirect, giving a faster and cleaner expiry experience (SC-002: < 500 ms). Reactive
handling covers edge cases where the system clock differs from server time or the token
is revoked early.

**Implementation detail**: JWT decoding reads only the payload (middle base64 segment) —
`JSON.parse(atob(token.split('.')[1]))`. No external library needed; signature
verification happens server-side.

**Alternatives Considered**:
- Reactive only (only handle 401): simpler but causes one failed API request before
  redirect — rejected to meet SC-002.

---

## Decision: Route Protection Strategy

**Decision**: A `ProtectedRoute` wrapper component reads `getSession()` and the JWT `exp`
claim synchronously on render. If the session is absent or the token is expired, it
stores the current path in the redirect state and performs a client-side navigation to
`/login`. Otherwise it renders `children`.

**Rationale**: Framework7 uses its own router. ProtectedRoute wraps the page component
in the route definition, so the check runs before the page renders. Storing the intended
path enables the "redirect to original destination after login" flow (spec clarification
Q2).

**Intended path storage**: The path is appended as a query param on the login redirect:
`/login?redirect=<encodedPath>`. `AuthCallbackPage` reads and restores it after sign-in.
`LoginPage` also reads it to pass through after a successful callback.

---

## Decision: Global 401 Handling in API Client

**Decision**: Extend `src/api/client.js` to inspect the HTTP status of every response.
On 401: call `clearSession()`, flush the TanStack Query cache via the shared
`queryClient` instance, and navigate to `/login?expired=1`.

**Rationale**: Centralising 401 handling in the API layer means no individual hook or
component needs to handle auth expiry — they simply receive the thrown error (which by
then won't reach them, as the page redirect has already fired).

**QueryClient access**: Export the `queryClient` instance from `src/main.jsx` (it is
already created there) so `client.js` can import it without creating a second instance.

---

## Decision: Framework7 Router Integration

**Decision**: Add `/login` and `/auth/callback` as routes in `App.jsx`. All other
existing and future routes are wrapped with `ProtectedRoute`. Framework7's `f7router`
handles navigation; `ProtectedRoute` uses `f7router.navigate()` for redirects.

**Rationale**: Stays entirely within the Framework7 routing system — no React Router
introduced. Consistent with the existing single-route setup in `App.jsx`.
