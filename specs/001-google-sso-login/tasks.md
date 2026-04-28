---
description: "Task list for Google SSO Login Page"
---

# Tasks: Google SSO Login Page

**Input**: Design documents from `/specs/001-google-sso-login/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No test tasks — per Principle IX (Velocity over Ceremony), no unit tests.

**Organization**: Tasks grouped by user story for independent implementation and validation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Exact file paths included in every description

---

## Phase 1: Setup

**Purpose**: Document required configuration before implementation begins.

- [x] T001 Create `.env.example` at repo root documenting required env vars:
  `LACHIWANA_SERVICE_URL` (backend base URL, e.g. `http://localhost:3000`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared infrastructure all user stories depend on. No user story work begins
until this phase is complete.

**⚠ CRITICAL**: T004 and T005 depend on T002/T003 being done first. Complete T002+T003
in parallel, then T004, then T005.

- [x] T002 [P] Create `src/queryClient.js` — export a single shared `QueryClient`
  instance with `{ defaultOptions: { queries: { retry: 1, staleTime: 10_000 } } }`.
  This replaces the inline instance currently in `src/main.jsx`.

- [x] T003 [P] Create `src/stores/authStore.js` — export three functions:
  `getSession()` reads and JSON-parses `localStorage.getItem('lachiwana_session')`;
  `setSession(session)` JSON-stringifies and writes to `lachiwana_session`;
  `clearSession()` calls `localStorage.removeItem('lachiwana_session')`.
  Also export `isTokenExpired(token)` which decodes the JWT payload middle segment
  (`JSON.parse(atob(token.split('.')[1]))`) and returns `true` if `exp * 1000 < Date.now()`.

- [x] T004 Update `src/main.jsx` — replace the inline `new QueryClient(...)` with an
  import of the shared instance from `src/queryClient.js`. Keep `QueryClientProvider`
  wrapping unchanged.

- [x] T005 Update `src/api/client.js` — (a) import `getSession`, `clearSession` from
  `src/stores/authStore.js` and `queryClient` from `src/queryClient.js`;
  (b) before each request, call `getSession()` and if a token is present add header
  `Authorization: Bearer ${session.token}`; (c) after receiving a response, if status
  is 401 call `clearSession()`, `queryClient.clear()`, then navigate the browser to
  `/login?expired=1`; (d) keep all existing `get()` and `request()` signatures unchanged.

**Checkpoint**: `authStore` and `queryClient` are available project-wide. The API
client injects auth headers and handles 401 globally.

---

## Phase 3: User Story 1 — Sign In with Google (Priority: P1) 🎯 MVP

**Goal**: User taps "Sign in with Google", completes Google consent, lands on the home
page as an authenticated user. First API call to `/api/v1/users` succeeds.

**Independent Test**: Open app with no session → login page renders → click "Sign in
with Google" → complete Google consent → land on home page → DevTools Network shows
`GET /api/v1/users` returning 200 with Authorization header present.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create `src/api/users.js` — export `fetchUsers` function that
  calls `get('/api/v1/users')` using the existing `get` helper from `src/api/client.js`.
  Response shape: `{ success, data: UserProfile[], timestamp }`.

- [x] T007 [P] [US1] Create `src/hooks/useUsers.js` — export `useUsers()` hook that
  calls `useQuery({ queryKey: ['users'], queryFn: fetchUsers })` imported from
  `src/api/users.js`. Re-export `data`, `isLoading`, `isError`, `error`.

- [x] T008 [P] [US1] Create `src/pages/LoginPage.jsx` — render a full-screen login page
  containing: (a) app logo/name in `BlockTitle`; (b) a custom `GoogleSignInButton`
  component with the Google logo SVG; (c) a `Preloader` shown while `loading` is `true`;
  (d) the button is disabled while `loading` is `true`.

- [x] T009 [P] [US1] Create `src/pages/AuthCallbackPage.jsx` — on mount: (a) read
  `token`, `user`, and `error` from URL search params; (b) if error or missing token,
  navigate to `/login?error=...`; (c) decode `user` via base64url; (d) call
  `setSession({ token, user })`; (e) navigate to `lachiwana_pending_redirect` or `/`.

- [x] T010 [US1] Update `src/App.jsx` — add `/login` and `/auth/callback` routes to the
  routes array. Import both page components.

- [x] T011 [US1] Update `src/pages/HomePage.jsx` — import `useUsers` from
  `src/hooks/useUsers.js`; add a Users block with `List`/`ListItem` rendering name,
  email, and avatar. Show `Preloader` while loading and an error message if the query
  fails.

**Checkpoint**: Full sign-in flow is independently functional. Unauthenticated protection
and expiry handling are not yet in place — that is expected at this stage.

---

## Phase 4: User Story 2 — Redirect Unauthenticated Access (Priority: P2)

**Goal**: Any navigation to `/` (or future protected routes) without a valid session is
intercepted before content renders and the user is redirected to `/login`.

**Independent Test**: Clear localStorage, navigate directly to `http://localhost:5173/`.
The login page must appear; home content must never render.

### Implementation for User Story 2

- [x] T012 [US2] Create `src/components/ProtectedRoute.jsx` — on render check session;
  if no session, navigate to `/login?redirect=<currentPath>` via `f7` singleton and
  return `null`; otherwise render `children`.

- [x] T013 [US2] Update `src/App.jsx` — wrap the `/` route with `ProtectedHome` (a
  named wrapper component that renders `<ProtectedRoute><HomePage /></ProtectedRoute>`).
  Set `resolveInitialUrl()` as the `View` initial URL to avoid a flash of null content.

**Checkpoint**: Unauthenticated users are redirected before home content appears. User
Stories 1 and 2 both work independently and together.

---

## Phase 5: User Story 3 — Session Expiry Redirect (Priority: P3)

**Goal**: An authenticated user whose Google ID Token has expired is redirected to the
login page with a "Your session has expired" message before any API error is visible.

**Independent Test**: Corrupt `lachiwana_session.token` in localStorage with an expired
JWT (exp in the past). Navigate to `/`. Redirected to `/login?expired=1`. Login page
shows expiry message.

### Implementation for User Story 3

- [x] T014 [US3] Update `src/components/ProtectedRoute.jsx` — after the "no session"
  check, call `isTokenExpired(session.token)`. If expired: call `clearSession()`, then
  navigate to `/login?expired=1&redirect=<currentPath>` and return `null`.

- [x] T015 [US3] Update `src/pages/LoginPage.jsx` — read `?expired=1` and `?error`
  URL params; render a styled status message block above the sign-in button for
  expired sessions, auth failures, and cancelled sign-in.

**Checkpoint**: Expired sessions are caught proactively at route entry AND reactively on
API 401 (covered by T005). Login page communicates the reason clearly.

---

## Phase 6: User Story 4 — Already-Authenticated Redirect (Priority: P4)

**Goal**: A user with a valid, non-expired session who navigates to `/login` is
redirected to the home page without seeing the login UI.

**Independent Test**: Sign in. Navigate to `http://localhost:5173/login`. Home page
loads; login UI is never visible.

### Implementation for User Story 4

- [x] T016 [US4] Update `src/pages/LoginPage.jsx` — on mount via `useEffect`, call
  `getSession()` and `isTokenExpired()`; if a valid session exists navigate to
  `?redirect` param or `/`. Return `null` until redirect fires.

**Checkpoint**: All four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T017 [P] Audit all component files for bare `fetch`/`axios` calls (Principle V
  compliance). Result: no violations found across `LoginPage.jsx`, `AuthCallbackPage.jsx`,
  `HomePage.jsx`, `ProtectedRoute.jsx`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. T002 and T003 parallel; T004 after T002;
  T005 after T002 + T003. **Blocks all user stories.**
- **User Stories (Phase 3+)**: All depend on Foundational completion.
  - US1 (P1): T006, T007, T008, T009 parallel; T010 after T008+T009; T011 after T006+T007.
  - US2 (P2): T012 after Foundational; T013 after T012+T010.
  - US3 (P3): T014 after T012; T015 after T008.
  - US4 (P4): T016 after T015.
- **Polish (Phase 7)**: After all user stories complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only.
- **US2 (P2)**: Depends on Foundational + US1 (App.jsx routes must exist).
- **US3 (P3)**: Depends on US2 (ProtectedRoute must exist) + US1 (LoginPage must exist).
- **US4 (P4)**: Depends on US3 (LoginPage messages must exist).

### Within Each User Story

- New files within a story: run in parallel.
- App.jsx updates: always sequential after dependent page/component files are done.
- Story complete and tested before moving to next priority.

### Parallel Opportunities

```bash
# Phase 2 parallel start:
Task T002: Create src/queryClient.js
Task T003: Create src/stores/authStore.js

# Phase 3 parallel start (after Phase 2 done):
Task T006: Create src/api/users.js
Task T007: Create src/hooks/useUsers.js
Task T008: Create src/pages/LoginPage.jsx
Task T009: Create src/pages/AuthCallbackPage.jsx
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: US1 (T006–T011)
4. **STOP and VALIDATE**: Sign in with Google → land on home page → users list loads.
5. Deploy/demo if ready.

### Incremental Delivery

1. Setup + Foundational → auth infrastructure ready
2. US1 → Full sign-in flow working (**MVP**)
3. US2 → Route protection added
4. US3 → Expiry handling complete
5. US4 → Login page guards added
6. Polish → Compliance audit

---

## Notes

- `[P]` tasks touch different files — safe to run in parallel
- `[US1]`–`[US4]` labels map tasks to acceptance scenarios in `spec.md`
- `quickstart.md` contains the manual test procedure for each user story
- **Backend prerequisite**: `handleGoogleCallback` in the backend must redirect to
  `${FRONTEND_URL}/auth/callback?token=...&user=...` instead of returning JSON.
  See `contracts/backend-auth-api.md` for the exact redirect shape. This must be done
  before US1 can be tested end-to-end.
