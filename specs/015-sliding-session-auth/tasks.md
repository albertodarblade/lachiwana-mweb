# Tasks: Sliding Session Auth — Frontend Integration

**Input**: Design documents from `specs/015-sliding-session-auth/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Tests**: Not requested (Constitution IX — no unit tests).

**Organization**: Tasks are grouped by user story. Phase 2 (Foundational) must complete before any user story phase begins. User Story phases can proceed independently once foundational work is done.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase
- **[Story]**: Which user story this task belongs to (US0–US4)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: New stores, new API module, and minimal init changes that all user story phases depend on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Create `src/stores/tokenStore.js` — module-level `_token`, `_expiresAt`, `_renewalTimer` variables; export `getToken()`, `setToken(accessToken, expiresAt)`, `clearToken()`; `setToken` cancels existing timer and calls `_scheduleRenewal(expiresAt)`; `_scheduleRenewal` fires 5 minutes before expiry; `_proactiveRefresh` calls `refreshToken()` from `src/api/auth.js`, on success calls `setToken()`, on 401 calls `clearToken()` and `window.location.replace('/login?expired=1')`; all paths emit `[auth]` console debug logs
- [x] T002 [P] Create `src/api/auth.js` — export `refreshToken()` as `POST /api/v1/auth/refresh` with `credentials: 'include'`, throws with `.status` on non-200; export `signOut()` as `POST /api/v1/auth/signout` with `credentials: 'include'`; uses raw `fetch` (NOT `client.js`) to avoid circular dependency; console log `[auth] refresh success` / `[auth] signout called`
- [x] T003 [P] Modify `src/stores/authStore.js` — add `getUser()` returning `getSession()?.user ?? null`; add `setUser(user)` writing `{ user }` to localStorage (no `token` field); update `clearSession()` to also call `clearToken()` from tokenStore (add import); remove `setSession()` export (replaced by `setUser()`)
- [x] T004 [P] Modify `src/main.jsx` — replace `getSession()?.user?.googleId` with `getUser()?.googleId`; add `import { getUser } from './stores/authStore'`; remove `getSession` import

**Checkpoint**: tokenStore, auth API module, and authStore shape all ready — user story implementation can now begin.

---

## Phase 3: User Story 0 — Auth Callback Token Capture (Priority: P0)

**Goal**: After Google sign-in, the frontend reads the new redirect params and stores the Access Token in memory (in-memory for redirect flow; via transient localStorage key for popup flow).

**Independent Test**: After Google sign-in completes, confirm: (1) `lachiwana_session` in localStorage has only `user` (no `token`); (2) no `lachiwana_oauth_token` key remains; (3) URL is clean (no `accessToken` param); (4) subsequent API calls succeed.

- [x] T005 Modify `src/pages/AuthCallbackPage.jsx` — read params `accessToken`, `expiresIn`, `expiresAt`, `user`, `error` (replacing old `token`/`user` params); **redirect flow**: call `tokenStore.setToken(accessToken, expiresAt)`, `authStore.setUser(user)`, then `window.history.replaceState({}, '', destination)` before navigating; **popup flow**: call `authStore.setUser(user)`, write `JSON.stringify({ accessToken, expiresAt })` to `localStorage.setItem('lachiwana_oauth_token', ...)`, then fire `lachiwana_oauth_done` and close; add `import { setToken } from '../stores/tokenStore'`; add `import { setUser } from '../stores/authStore'`; remove `setSession` import; log `[auth] token captured at callback`
- [x] T006 Modify `src/pages/LoginPage.jsx` — in `handleStorage` after `localStorage.removeItem('lachiwana_oauth_done')`: read `lachiwana_oauth_token`, parse JSON, call `tokenStore.setToken(accessToken, expiresAt)`, delete key; apply same addition in `pollClosed` fallback `missedDestination` branch; update startup `useEffect` check from `getSession() && !isTokenExpired(session.token)` to `getToken()`; add imports for `getToken` from tokenStore and `setToken`; remove `getSession`/`isTokenExpired` imports; log `[auth] token captured from popup handoff`

**Checkpoint**: Sign-in flow fully migrated. Token lands in memory, not localStorage.

---

## Phase 4: User Story 1 — Transparent Session Continuation (Priority: P1) 🎯 MVP

**Goal**: A 401 from any API call silently triggers a single refresh and replays the original request. Concurrent 401s queue and reuse one refresh result.

**Independent Test**: Sign in, expire the token (or wait 1h), make any API call — verify it succeeds without a login redirect and exactly one `POST /api/v1/auth/refresh` call appears in Network tab.

- [x] T007 Refactor `src/api/client.js` — consolidate `request`, `jsonRequest`, `getBlob`, `postForm` into a single internal `_request(method, path, opts)` dispatcher (eliminates ~80 lines of duplicated 401 logic); add module-level `let _refreshPromise = null`; 401 handler: if `_refreshPromise` is null, set it to `refreshToken().finally(() => _refreshPromise = null)`; await `_refreshPromise`; on success call `setToken(data.accessToken, data.expiresAt)` and retry request ONCE; on error `status === 401` call `clearSession()` + `queryClient.clear()` + `window.location.replace('/login?expired=1')`; on error `status === 429` call `f7.toast.create({ text: 'Demasiadas solicitudes, espera un momento.', closeTimeout: 3000 }).open()`; replace all `getSession()?.token` reads with `getToken()`; add imports `getToken`, `setToken` from tokenStore; `refreshToken` from api/auth; `f7` from framework7-react; console logs `[auth] 401 intercepted`, `[auth] token refreshed, retrying`, `[auth] refresh failed`, `[auth] rate limited`
- [x] T008 [P] Modify `src/components/ProtectedRoute.jsx` — replace `getSession()`, `isTokenExpired()`, `clearSession()` with `getToken()` from tokenStore; new logic: `const token = getToken()`; redirect to `/login?redirect=...` if `!token`; remove all other imports from authStore; add `import { getToken } from '../stores/tokenStore'`

**Checkpoint**: Silent token refresh works end-to-end. App never forces re-login during an active session.

---

## Phase 5: User Story 2 — Proactive Token Renewal (Priority: P2)

**Goal**: The token is refreshed in the background 5 minutes before expiry — no API call is ever blocked by an expiry.

**Independent Test**: After sign-in, verify (via Network tab or console logs) that `[auth] proactive refresh triggered` appears approximately 55 minutes after sign-in (or sooner if token expiry is shortened for testing).

- [x] T009 Audit proactive renewal wiring in `src/stores/tokenStore.js` — confirm `_scheduleRenewal(expiresAt)` is called inside `setToken()`; confirm `_proactiveRefresh()` imports `refreshToken` from `../api/auth` (NOT from client.js); confirm on success it calls `setToken(accessToken, expiresAt)` (which re-schedules the next renewal); confirm on 401 it calls `clearToken()` and redirects; confirm `clearToken()` calls `clearTimeout(_renewalTimer)` to prevent renewal after sign-out; no new files — verification and fix pass on T001's output

**Checkpoint**: Token never expires during active use; proactive renewal is self-scheduling.

---

## Phase 6: User Story 3 — Session Expiry & Startup Restore (Priority: P3)

**Goal**: On cold page load, the app shows a spinner, attempts a silent refresh, and navigates to the destination (or login) once resolved. If the Refresh Token is expired, the user is sent to login.

**Independent Test**: Open the app in a new tab (no in-memory token) with a valid Refresh Token cookie — verify a spinner appears briefly, then the home screen renders. Delete the `lachiwana_rt` cookie and reload — verify redirect to `/login`.

- [x] T010 Modify `src/App.jsx` — add `const [sessionChecked, setSessionChecked] = useState(false)`; add startup `useEffect`: skip if `pathname === '/auth/callback'` or starts with `/login` (set `sessionChecked(true)` and return); else call `refreshToken()`, on success call `setToken(accessToken, expiresAt)`, always call `setSessionChecked(true)` in `finally`; add early return rendering `<div data-testid="app-session-loading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><Preloader size={44} /></div>` while `!sessionChecked`; add `Preloader` to framework7-react import; add `import { refreshToken } from './api/auth'`; add `import { setToken, getToken } from './stores/tokenStore'`; replace `getSession()?.user` with `getUser()` in `f7params` object; add `import { getUser } from './stores/authStore'`; remove `getSession` import

**Checkpoint**: Session survives page reloads. Expired sessions redirect cleanly to login.

---

## Phase 7: User Story 4 — Explicit Sign-Out (Priority: P4)

**Goal**: Clicking sign-out calls the backend, clears the in-memory token and user data, and navigates to login.

**Independent Test**: Sign in, click sign-out — verify redirect to `/login`, `lachiwana_rt` cookie absent, any subsequent protected API call returns 401.

- [x] T011 Add sign-out handler to `src/pages/SettingsPage.jsx` — import `signOut` from `../api/auth`; import `clearSession` from `../stores/authStore`; add async `handleSignOut()`: call `await signOut()`, call `clearSession()`, `window.location.replace('/login')`; wire to the sign-out button (create button if not present): `<Button ... onClick={handleSignOut} data-testid="settings-signout">Cerrar sesión</Button>`; wrap in try/catch (sign-out endpoint is idempotent — proceed to redirect even if call fails)

**Checkpoint**: All four user stories fully implemented. Full session lifecycle (sign-in → use → refresh → sign-out) works end-to-end.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and verification across all changed files.

- [x] T012 [P] Audit `[auth]` console log coverage — verify each of these log lines exists: `[auth] token captured at callback` (AuthCallbackPage), `[auth] token captured from popup handoff` (LoginPage), `[auth] refresh success` (auth.js), `[auth] signout called` (auth.js), `[auth] 401 intercepted, refreshing token` (client.js), `[auth] token refreshed, retrying` (client.js), `[auth] refresh failed, signing out` (client.js), `[auth] rate limited on refresh` (client.js), `[auth] proactive refresh triggered` (tokenStore), `[auth] proactive refresh success` (tokenStore), `[auth] proactive refresh failed` (tokenStore)
- [x] T013 [P] Dead-code cleanup in `src/stores/authStore.js` — confirm `setSession()` is no longer called anywhere (grep codebase); remove it if confirmed unused; confirm `isTokenExpired()` is no longer imported anywhere; remove if unused
- [x] T014 Run quickstart.md validation — perform all 4 manual test scenarios from `specs/015-sliding-session-auth/quickstart.md`: fresh sign-in, page reload restore, 429 toast display, sign-out

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. T002, T003, T004 are parallel with each other; T001 can also run in parallel (different files).
- **US0 (Phase 3)**: Depends on Phase 2 complete (needs tokenStore, authStore updates). T005 and T006 touch different files — can be parallelized.
- **US1 (Phase 4)**: Depends on Phase 2. T007 and T008 touch different files — can be parallelized.
- **US2 (Phase 5)**: Depends on Phase 2 (T001) and Phase 3 (T005, T006) — verifies wiring end-to-end.
- **US3 (Phase 6)**: Depends on Phase 2 and Phase 4 complete (App.jsx calls refreshToken which is used by client.js too).
- **US4 (Phase 7)**: Depends on Phase 2 (auth.js, authStore) — otherwise independent of US0–US3.
- **Polish (Phase 8)**: Depends on all story phases complete.

### User Story Dependencies

- **US0 (P0)**: Must complete before US1 can be validated end-to-end (sign-in must work to get a token)
- **US1 (P1)**: Can be implemented concurrently with US0 (different files); needs US0 to run the sign-in test
- **US2 (P2)**: Verification only — covered by T001 + T005–T007; no new implementation
- **US3 (P3)**: Can be implemented concurrently with US1 (App.jsx vs client.js — different files)
- **US4 (P4)**: Independent of US0–US3; only needs Phase 2 (auth.js, authStore)

### Within Each Phase

- [P]-marked tasks within the same phase can run concurrently
- T001 must complete before tokenStore is usable in any story phase

---

## Parallel Opportunities

### Phase 2 (Foundational)

All four tasks touch different files and can run in parallel:

```
Parallel: T001 (tokenStore.js) + T002 (auth.js) + T003 (authStore.js) + T004 (main.jsx)
```

### Phase 3 (US0)

```
Parallel: T005 (AuthCallbackPage.jsx) + T006 (LoginPage.jsx)
```

### Phase 4 (US1)

```
Parallel: T007 (client.js) + T008 (ProtectedRoute.jsx)
```

### Phase 8 (Polish)

```
Parallel: T012 (log audit) + T013 (dead-code cleanup)
```

---

## Implementation Strategy

### MVP First (US0 + US1 only — core session lifecycle)

1. Complete Phase 2 (Foundational) — all 4 tasks
2. Complete Phase 3 (US0) — callback and popup token capture
3. Complete Phase 4 (US1) — silent refresh and route protection
4. **STOP and VALIDATE**: Sign in, wait for expiry, verify silent refresh. Sign out (manually clear cookie). Reload page, verify spinner and restore.
5. US2 (proactive renewal) is automatically covered by this point.

### Incremental Delivery

1. Phase 2 → Foundation ready
2. Phase 3 + Phase 4 → Core session lifecycle working (MVP!)
3. Phase 5 → Proactive renewal verified
4. Phase 6 → Startup restore polished (spinner)
5. Phase 7 → Sign-out wired
6. Phase 8 → Cleanup + final validation

---

## Notes

- All `[P]` tasks = different source files, zero dependency on each other within the phase
- tokenStore.js is a pure ES module singleton — no React, no context, no imports from framework7
- client.js must import from auth.js (not itself) to avoid circular dependency on the refresh path
- The `lachiwana_oauth_token` localStorage key has a lifetime of < 50ms — it is not a security concern
- `isTokenExpired()` in authStore.js may become dead code after this migration; T013 cleans it up
