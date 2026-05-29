# Quickstart: Sliding Session Auth — Frontend Integration

**Feature**: 015-sliding-session-auth  
**Date**: 2026-05-25

---

## Prerequisites

- Backend (`../Lachiwana-service`) running with the sliding session auth feature live (branch `010-sliding-session-auth` or merged to main)
- `.env` or `.env.local` with `LACHIWANA_SERVICE_URL=http://localhost:3000` (or wherever the backend is)
- pnpm installed

---

## Running Locally

```bash
pnpm dev
```

Navigate to `http://localhost:5173` (or the Vite port shown in the terminal).

---

## Testing the Auth Flow End-to-End

### 1. Fresh sign-in (cold start)

1. Open the app in a new private/incognito window (no existing cookies)
2. Click "Continuar con Google"
3. Complete Google sign-in
4. Verify: you land on the home screen with no login prompt
5. Open DevTools → Application → Cookies: verify `lachiwana_rt` cookie is present with `HttpOnly` flag
6. Open DevTools → Application → Local Storage: verify `lachiwana_session` does NOT contain a `token` field (only `user`)

### 2. Page reload (startup session restore)

1. While authenticated, reload the page (`Ctrl+R` / `Cmd+R`)
2. Verify: a loading spinner appears briefly, then the home screen renders
3. Verify: no login redirect occurs
4. Network tab: confirm one `POST /api/v1/auth/refresh` call on load

### 3. Silent token refresh on 401 (simulated)

1. Open DevTools → Application → Cookies
2. Note the `lachiwana_rt` cookie value (it's HttpOnly; you won't see the value, but you can delete it to test)
3. To simulate token expiry: in the browser console, run:
   ```javascript
   // Manually clear the in-memory token (forces 401 on next call)
   // This requires accessing the module — not directly possible from console
   // Use: set a breakpoint in tokenStore.js and modify _token, or wait 1 hour
   ```
4. Alternative: set the backend token lifetime to 10 seconds via env var for testing

### 4. Sign-out

1. Navigate to Settings
2. Click sign-out
3. Verify: redirected to login screen
4. Verify: `lachiwana_rt` cookie is gone (cleared by backend response)
5. Navigate to any protected route: verify redirect to login

---

## CORS Configuration Note

The refresh and sign-out endpoints use `credentials: 'include'`. In development, the backend must have CORS configured to allow:
- `origin: 'http://localhost:5173'` (or your Vite dev URL)
- `credentials: true`

Without this, the `lachiwana_rt` cookie will not be sent on cross-origin requests.

---

## Key Files Changed

| File | Change |
|------|--------|
| `src/stores/tokenStore.js` | NEW — in-memory token + renewal timer |
| `src/stores/authStore.js` | MODIFIED — removes token from localStorage |
| `src/api/auth.js` | NEW — `refreshToken()`, `signOut()` API calls |
| `src/api/client.js` | MODIFIED — 401 interceptor, refresh queue, 429 toast |
| `src/pages/AuthCallbackPage.jsx` | MODIFIED — new URL params, clears URL, popup handoff |
| `src/pages/LoginPage.jsx` | MODIFIED — reads transient token from localStorage after popup |
| `src/components/ProtectedRoute.jsx` | MODIFIED — checks `getToken()` instead of `getSession().token` |
| `src/App.jsx` | MODIFIED — startup session restore, loading spinner |
| `src/main.jsx` | MODIFIED — uses `getUser()` instead of `getSession()?.user` |
