# Research: Sliding Session Auth — Frontend Integration

**Feature**: 015-sliding-session-auth  
**Date**: 2026-05-25

---

## Decision 1: In-Memory Token Storage Mechanism

**Decision**: Store the Access Token in a plain JavaScript module-level variable (`let _token = null`) exported via getter/setter functions in `src/stores/tokenStore.js`.

**Rationale**: Module-level variables in ES Modules are singletons — the same instance is shared across all imports within a Vite bundle. This gives global, synchronous access without React state, context, or a reactive store. It is the simplest correct approach and requires no dependencies.

**Alternatives considered**:
- React Context: Would require a Provider wrapping the entire app and force re-renders on every token update — overly complex for what is effectively a global singleton.
- Zustand store: Adds a dependency and reactive overhead for a value that only needs synchronous reads (the API client is not a React component).
- sessionStorage: Persists across same-tab reloads (partially) but is accessible via JS — violates the in-memory-only security requirement.

---

## Decision 2: Popup OAuth Token Handoff

**Decision**: `AuthCallbackPage` (running in the popup) writes the Access Token and its expiry to a transient localStorage key (`lachiwana_oauth_token`) before firing the `lachiwana_oauth_done` signal. The main window's `LoginPage` reads this key, calls `tokenStore.setToken()`, then immediately deletes the key.

**Rationale**: The popup and main window are in different browsing contexts (Google's COOP header destroys `window.opener`). `postMessage` is unavailable. The token must cross the context boundary. Using a short-lived localStorage key is the established pattern in this codebase (already used for `lachiwana_oauth_done`). The token is in localStorage for fewer than 50ms — the time between the storage event firing and the main window's event handler running — which is not exploitable in practice.

**Alternatives considered**:
- Call `POST /api/v1/auth/refresh` from the main window after the popup closes: Requires an extra network round-trip. The access token from the callback is discarded, and a new one is fetched. This works but is slower and wasteful.
- Use BroadcastChannel API: Not supported on all mobile browsers that are primary targets for this PWA.

---

## Decision 3: Concurrent Refresh De-duplication

**Decision**: `src/api/client.js` holds a module-level `_refreshPromise` variable. When a 401 triggers a refresh, any other concurrent 401s check if `_refreshPromise` is non-null and await it instead of starting a new refresh. On resolution, all waiters get the same result.

**Rationale**: This is the standard "single-flight" pattern for token refresh. It prevents N concurrent 401s from making N refresh calls, which would trigger the backend's replay detection (second request with the same Refresh Token would get a 401, invalidating the session unnecessarily).

**Implementation sketch**:
```javascript
let _refreshPromise = null

async function silentRefresh() {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = doRefresh().finally(() => { _refreshPromise = null })
  return _refreshPromise
}
```

---

## Decision 4: 429 Notification Mechanism

**Decision**: Use Framework7's programmatic `toast` (via `f7.toast.create({ ... }).open()`) to display "Demasiadas solicitudes, espera un momento." when the refresh endpoint returns 429. Do not navigate away.

**Rationale**: Framework7 Toast is already in the bundle (zero added weight), matches the app's visual language, and is the correct non-blocking notification primitive for transient errors. The session is not cleared — the user's Refresh Token is still valid, they simply hit a rate limit.

**Note**: `f7` is accessible via `import { f7 } from 'framework7-react'` and can be called outside React components (it is a singleton).

---

## Decision 5: Startup Session Restore Location

**Decision**: Place startup session restore logic in `App.jsx` using a `sessionChecked` state variable. Show a full-screen `Preloader` until the async restore attempt resolves. Skip restore if `window.location.pathname` is `/auth/callback` (the callback page handles its own token setup).

**Rationale**: Doing it in `App.jsx` before Framework7 renders prevents any flash of wrong content (blank protected route vs. login redirect) and avoids needing to thread async state through ProtectedRoute. ProtectedRoute remains a thin synchronous guard checking `getToken()`.

---

## Decision 6: Constitution Principle V (TanStack Query) — Justified Deviation

**Decision**: The token refresh call (`POST /api/v1/auth/refresh`) is made via a raw `fetch` call in `src/api/auth.js`, NOT through TanStack Query.

**Rationale**: TanStack Query is designed for component-level data fetching via React hooks. The token refresh interceptor runs inside `src/api/client.js` — a plain JavaScript module, not a React component. There is no `useQuery`/`useMutation` hook available there. This is a justified infrastructure-layer deviation: all actual data queries and mutations (notebooks, notes, transactions, etc.) continue to go through TanStack Query exclusively. The refresh call is auth plumbing, not data fetching.

**This must be noted in the plan's Complexity Tracking table.**
