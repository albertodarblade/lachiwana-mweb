# Frontend Auth Interface Contracts

**Feature**: 015-sliding-session-auth  
**Date**: 2026-05-25

---

## Backend API Endpoints Consumed

Full backend contract: `../Lachiwana-service/specs/010-sliding-session-auth/contracts/`

### POST /api/v1/auth/refresh

**Called by**: `src/api/auth.js → refreshToken()`, `src/stores/tokenStore.js` (proactive renewal timer)

**Request**:
- Method: `POST`
- Body: empty
- Credentials: `include` (sends `lachiwana_rt` HttpOnly cookie automatically)
- No `Authorization` header

**Success response** `200 OK`:
```json
{
  "data": {
    "accessToken": "<jwt>",
    "expiresIn": 3600,
    "expiresAt": "<ISO-8601>"
  }
}
```

**Error responses**:
- `401` → session expired or no cookie — clear token, redirect to `/login?expired=1`
- `429` → rate limit — show Framework7 toast, do not clear token or redirect

---

### POST /api/v1/auth/signout

**Called by**: sign-out handler (e.g., SettingsPage)

**Request**:
- Method: `POST`
- Body: empty
- Credentials: `include` (sends `lachiwana_rt` HttpOnly cookie automatically)
- No `Authorization` header

**Success response** `200 OK` — always succeeds (idempotent)

---

### GET /api/v1/auth/google/callback (backend-initiated redirect)

**Not called directly by frontend.** The backend redirects to:

```
{FRONTEND_REDIRECT_URL}/auth/callback?accessToken=<jwt>&expiresIn=3600&expiresAt=<ISO-8601>&user=<urlEncoded>
```

**Frontend handler**: `src/pages/AuthCallbackPage.jsx`

**URL param contract**:

| Param | Type | Action |
|-------|------|--------|
| `accessToken` | string (JWT) | Call `tokenStore.setToken(accessToken, expiresAt)` |
| `expiresIn` | number (seconds) | Informational; `expiresAt` is used for scheduling |
| `expiresAt` | string (ISO 8601) | Pass to `tokenStore.setToken()` |
| `user` | string (URL-encoded JSON) | Parse and call `authStore.setUser(user)` |
| `error` | string (optional) | If present, redirect to `/login?error=<value>` |

---

## Frontend Module Interface: tokenStore

**File**: `src/stores/tokenStore.js`  
**Consumers**: `src/api/client.js`, `src/api/auth.js`, `src/pages/AuthCallbackPage.jsx`, `src/pages/LoginPage.jsx`, `src/App.jsx`, `src/components/ProtectedRoute.jsx`

```javascript
getToken()                        // → string | null
setToken(accessToken, expiresAt)  // → void
clearToken()                      // → void
```

---

## Frontend Module Interface: authStore (updated)

**File**: `src/stores/authStore.js`  
**Consumers**: `src/App.jsx`, `src/main.jsx`, `src/pages/LoginPage.jsx`, `src/pages/AuthCallbackPage.jsx`, Settings sign-out handler

```javascript
getUser()           // → object | null  (NEW)
setUser(user)       // → void           (NEW)
clearSession()      // → void           (MODIFIED — also calls clearToken())
```

---

## Protected API Requests

All calls to protected endpoints go through `src/api/client.js`. The client:
1. Reads `tokenStore.getToken()` and sets `Authorization: Bearer <token>` header
2. On `401` response: triggers single-flight refresh, retries request
3. On `429` response from refresh endpoint: shows toast
4. All requests include `credentials: 'same-origin'` (default fetch behaviour for same-origin)

> Note: Only auth endpoints (`/api/v1/auth/refresh`, `/api/v1/auth/signout`) need `credentials: 'include'`. Regular API calls use same-origin credentials (no change needed).
