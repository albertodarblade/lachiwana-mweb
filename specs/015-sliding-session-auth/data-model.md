# Data Model: Sliding Session Auth — Frontend Integration

**Feature**: 015-sliding-session-auth  
**Date**: 2026-05-25

---

## In-Memory State: tokenStore (`src/stores/tokenStore.js`)

Module-level singleton. Not persisted to any storage medium.

| Variable | Type | Description |
|----------|------|-------------|
| `_token` | `string \| null` | Current Access Token (JWT). Null on cold start or after sign-out. |
| `_expiresAt` | `string \| null` | ISO 8601 expiry timestamp received from backend. Used to schedule proactive renewal. |
| `_renewalTimer` | `number \| null` | `setTimeout` ID of the scheduled proactive renewal. Cleared on sign-out or new token set. |

**Public interface**:

| Function | Signature | Behaviour |
|----------|-----------|-----------|
| `getToken()` | `() => string \| null` | Returns current token or null. |
| `setToken(accessToken, expiresAt)` | `(string, string) => void` | Stores token, cancels any existing timer, schedules proactive renewal. |
| `clearToken()` | `() => void` | Sets `_token` and `_expiresAt` to null, cancels renewal timer. |

**Proactive renewal**: `setToken` schedules a `setTimeout` to fire 5 minutes before `expiresAt`. On fire, it calls `POST /api/v1/auth/refresh`, and on success calls `setToken` again with the new values. On failure (401), calls `clearToken` and redirects to `/login?expired=1`.

---

## Persistent State: authStore (`src/stores/authStore.js`) — Modified

localStorage key: `lachiwana_session`

**Before (current)**:
```json
{ "token": "<jwt>", "user": { "googleId": "...", "picture": "...", ... } }
```

**After (new shape)**:
```json
{ "user": { "googleId": "...", "picture": "...", ... } }
```

The `token` field is **removed** from the persisted object. Functions updated:

| Function | Change |
|----------|--------|
| `getUser()` | NEW — returns `getSession()?.user ?? null` |
| `setUser(user)` | NEW — writes `{ user }` to localStorage (token-free) |
| `clearSession()` | MODIFIED — also calls `clearToken()` from tokenStore |
| `getSession()` | UNCHANGED (reads raw object; callers migrated away from `.token`) |
| `setSession(session)` | UNCHANGED (used only by legacy code, retired by this feature) |
| `isTokenExpired(token)` | UNCHANGED (utility retained but no longer called at startup) |

---

## Transient Handoff Key (popup OAuth flow)

localStorage key: `lachiwana_oauth_token`

**Lifetime**: Written by `AuthCallbackPage` (popup context), deleted by `LoginPage` (main window) within ~50ms. Never persisted beyond the OAuth popup close event.

**Shape**:
```json
{ "accessToken": "<jwt>", "expiresAt": "<ISO-8601>" }
```

---

## Module-Level Refresh State: client.js

Not persisted. Lives inside `src/api/client.js`.

| Variable | Type | Description |
|----------|------|-------------|
| `_refreshPromise` | `Promise \| null` | In-flight refresh call. All concurrent 401s await this single promise. Set to null on resolution. |

---

## State Lifecycle

```
Cold start (page load)
  → tokenStore._token = null
  → App.jsx calls POST /api/v1/auth/refresh
  → on success: tokenStore.setToken(accessToken, expiresAt)
  → on failure: ProtectedRoute redirects to /login

Google sign-in (popup flow)
  → AuthCallbackPage (popup): writes lachiwana_oauth_token to localStorage
  → LoginPage (main): reads key, calls tokenStore.setToken(), deletes key
  → App.jsx sessionChecked already true (login page path skips restore)

Google sign-in (redirect flow)
  → AuthCallbackPage: calls tokenStore.setToken() directly
  → navigates to destination

Token expiry (proactive)
  → renewalTimer fires → POST /api/v1/auth/refresh
  → success: tokenStore.setToken() (new values, timer rescheduled)

Token expiry (reactive — 401 interceptor)
  → client._refreshPromise guards concurrent calls
  → success: tokenStore.setToken(), retry queued requests
  → failure (401): tokenStore.clearToken(), redirect to /login?expired=1
  → failure (429): F7 toast, no redirect

Sign-out
  → POST /api/v1/auth/signout
  → tokenStore.clearToken()
  → authStore.clearSession() (clears user + React Query cache)
  → navigate to /login
```
