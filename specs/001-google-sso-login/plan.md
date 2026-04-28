# Implementation Plan: Google SSO Login Page

**Branch**: `001-google-sso-login` | **Date**: 2026-04-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-google-sso-login/spec.md`

## Summary

Add a Google SSO login page as the sole authentication entry point for the Lachiwana
mobile web app. Sign-in initiates a full-page redirect through the backend Google OAuth
flow; the backend delivers the token to a dedicated frontend callback route; the session
is persisted in localStorage; all other routes are gated behind an auth check. Expired
or missing sessions redirect to this page with a descriptive status message.

## Technical Context

**Language/Version**: JavaScript (ES2022) / React 19
**Primary Dependencies**: Framework7 9.x (UI), TanStack Query v5 (server state), Vite 8
**Storage**: Browser localStorage — key `lachiwana_session`, value `{ token, user }`
**Testing**: Manual (no unit tests — Principle IX)
**Target Platform**: Mobile browsers (iOS Safari, Android Chrome); SPA hosted on Vercel
**Project Type**: Mobile web app (SPA)
**Performance Goals**: Login page render < 2 s; unauthenticated redirect < 500 ms (SC-002/004)
**Constraints**: Framework7-only UI; TanStack Query for all server state; no bare fetch
  in components; no third-party auth libraries
**Scale/Scope**: Single active session per browser; 5 routes total in this feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — LoginPage built on F7 `LoginScreen` (mobile-optimised).
      No desktop-first layout choices anywhere in this feature.
- [x] **II. Minimalist Layout** — Single CTA ("Sign in with Google"); no competing actions
      on the login screen.
- [x] **III. Framework7** — All UI built with F7 primitives: `LoginScreen`,
      `LoginScreenTitle`, `Block`, `Button`, `Preloader`. No external component library.
- [x] **IV. Custom Components** — The Google-branded sign-in button is custom-built
      (F7 ships no branded OAuth button); styled to match F7 visual language.
- [x] **V. TanStack Query** — `useUsers()` uses `useQuery`; no bare `fetch` calls in
      any component. Auth initiation is a browser navigation (not an API call).
- [ ] **VI. Optimistic UI** — Exception: see Complexity Tracking. OAuth sign-in is a
      full-page navigation flow; no server mutation exists to optimistically update.
- [x] **VII. Cache Integrity** — On session clear (401 or expiry),
      `queryClient.clear()` flushes all cached server state before redirect.
- [x] **VIII. Clean Code** — Single-responsibility modules: `authStore` (persistence),
      `ProtectedRoute` (guard), `AuthCallbackPage` (token intake), `LoginPage` (UI).
- [x] **IX. No Unit Tests** — No test files planned or created.
- [x] **X. Maintainability** — New files extend the existing `src/` layout; `stores/`
      directory added for auth state, clearly separate from `api/` and `pages/`.

## Project Structure

### Documentation (this feature)

```text
specs/001-google-sso-login/
├── plan.md                       # This file
├── research.md                   # Phase 0 output
├── data-model.md                 # Phase 1 output
├── quickstart.md                 # Phase 1 output
├── contracts/
│   └── backend-auth-api.md       # Phase 1 output
└── tasks.md                      # /speckit-tasks output
```

### Source Code

```text
src/
├── api/
│   ├── client.js              ← UPDATE: inject Authorization header; handle 401 globally
│   ├── health.js              ← no change
│   └── users.js               ← NEW: fetchUsers → GET /api/v1/users
├── hooks/
│   ├── useHealth.js           ← no change
│   └── useUsers.js            ← NEW: useQuery(['users'], fetchUsers)
├── pages/
│   ├── HomePage.jsx           ← no change
│   ├── LoginPage.jsx          ← NEW: F7 LoginScreen + Google SSO button
│   └── AuthCallbackPage.jsx   ← NEW: reads token from URL, stores session, redirects
├── stores/
│   └── authStore.js           ← NEW: getSession / setSession / clearSession
├── components/
│   └── ProtectedRoute.jsx     ← NEW: checks session + JWT expiry; redirects to /login
└── App.jsx                    ← UPDATE: add routes + ProtectedRoute wrapping
```

**Structure Decision**: Flat `src/` layout extended with one new top-level directory
(`stores/`). No new npm dependencies added. All UI strictly via Framework7.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle VI (Optimistic UI) inapplicable to OAuth sign-in | Sign-in is a full-page redirect + Google round-trip. The `idToken` only exists after Google responds; there is no server-state mutation the UI can mirror optimistically. | Showing a fake "logged in" state before the token arrives would require immediate rollback on every flow, producing more user confusion than the 0 ms saved. A loading state on the button is the correct UX pattern here. |
