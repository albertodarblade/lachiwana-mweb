# Quickstart: Google SSO Login Page

**Feature**: `001-google-sso-login` | **Date**: 2026-04-28

---

## Prerequisites

1. Backend running at `http://localhost:3000` with Google OAuth configured.
2. `VITE_API_BASE_URL=http://localhost:3000` in `.env.local`.
3. **Backend prerequisite**: `handleGoogleCallback` must redirect to
   `${FRONTEND_URL}/auth/callback?token=...` (see `contracts/backend-auth-api.md`).
4. Frontend dev server: `pnpm dev` → `http://localhost:5173`.

---

## Testing the Sign-In Flow (US1)

1. Open `http://localhost:5173` — app should redirect to `/login` (no session).
2. Tap "Sign in with Google".
3. Complete the Google consent screen with a Google account.
4. You should land back on the app home page (`/`) as an authenticated user.
5. Open browser DevTools → Application → Local Storage → `lachiwana_session`:
   verify it contains `{ token, user }`.

**Expected**: Home page loads; no 401 errors in the network tab.

---

## Testing Unauthenticated Redirect (US2)

1. Clear localStorage (`lachiwana_session` key) or open a private window.
2. Navigate directly to `http://localhost:5173/` (the protected home route).
3. **Expected**: Immediately redirected to `/login?redirect=%2F` before home content renders.

---

## Testing Session Expiry Redirect (US3)

**Option A — Wait**: Wait ~1 hour after sign-in without refreshing, then interact with the app.

**Option B — Force expiry** (dev shortcut):
1. Open DevTools → Application → Local Storage.
2. Edit `lachiwana_session`: change `token` to `eyJ.eyJleHAiOjE2MDB9.sig` (a JWT with
   `exp` in the past: `{"exp": 1600}` in the payload).
3. Navigate to any protected route.
4. **Expected**: Redirected to `/login?expired=1` with message "Your session has expired."

**Option C — Force 401**:
1. Edit `lachiwana_session.token` to any non-JWT string (e.g., `invalid`).
2. Trigger a page that loads data (e.g., home page refresh).
3. **Expected**: API returns 401 → session cleared → redirected to `/login?expired=1`.

---

## Testing Already-Authenticated Redirect (US4)

1. Sign in successfully.
2. Navigate directly to `http://localhost:5173/login`.
3. **Expected**: Immediately redirected to `/` (or last intended destination); login UI
   never renders.

---

## Testing OAuth Cancellation (Edge Case)

1. On the login page, tap "Sign in with Google".
2. On the Google consent screen, click "Cancel" or close the browser window.
3. **Expected**: Redirected back to `/login?error=access_denied` with message
   "Sign-in was cancelled."

---

## Testing Users API After Sign-In

1. Sign in successfully.
2. On the home page (or any page using `useUsers()`), open DevTools → Network.
3. Confirm `GET /api/v1/users` returns 200 with an array of users.
4. Confirm the `Authorization: Bearer <token>` header is present on the request.
