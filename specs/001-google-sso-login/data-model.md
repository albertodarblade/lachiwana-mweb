# Data Model: Google SSO Login Page

**Feature**: `001-google-sso-login` | **Date**: 2026-04-28

---

## AuthSession (localStorage)

Represents the authenticated state persisted on the device.

**Storage key**: `lachiwana_session`
**Scope**: Browser localStorage — survives tab/browser close; cleared on 401 or sign-out.

| Field | Type | Description |
|-------|------|-------------|
| `token` | `string` | Google ID Token JWT. Sent as `Authorization: Bearer <token>` on all protected requests. Expires ~1 hour after issuance. |
| `user` | `UserProfile` | User identity data returned from the OAuth callback. |

**Lifecycle**:
- **Created**: `AuthCallbackPage` calls `setSession({ token, user })` after reading URL params.
- **Read**: `getSession()` is called by `ProtectedRoute` on every route transition and by `client.js` before each API request.
- **Cleared**: `clearSession()` is called on 401 response (API client) or proactive expiry detection (ProtectedRoute).

**Validation rules**:
- `token` MUST be a non-empty string and a structurally valid JWT (3 dot-separated segments).
- `user.googleId` MUST be present; all other user fields are required but may be empty strings.
- `token.exp` (decoded from JWT payload) MUST be in the future; if not, treat as absent.

---

## UserProfile

Read-only identity snapshot from the Google OAuth callback. Stored inside `AuthSession`.

| Field | Type | Nullable | Description |
|-------|------|----------|-------------|
| `googleId` | `string` | No | Stable Google subject identifier. |
| `email` | `string` | No | User's Google account email. |
| `name` | `string` | No | User's display name. |
| `picture` | `string` | Yes | URL of the Google profile photo. `null` if account has no photo. |
| `createdAt` | `string` | No | ISO 8601 timestamp; when the user was first registered in Lachiwana. |

---

## URL Parameters — AuthCallbackPage

Parameters received at `/auth/callback` after the backend OAuth redirect.

| Param | Source | Description |
|-------|--------|-------------|
| `token` | Backend redirect | The Google ID Token JWT. |
| `user` | Backend redirect | `base64url(JSON.stringify(UserProfile))`. Decoded to populate `AuthSession.user`. |
| `redirect` | LoginPage | Optional. The original path the user was trying to reach before being sent to login. Used to navigate to the intended destination after sign-in. |
| `error` | Backend (on failure) | Optional. Error code from the backend if the OAuth flow failed (e.g., `access_denied`). |

---

## URL Parameters — LoginPage

Parameters read by `LoginPage` to display status messages.

| Param | Value | Message shown |
|-------|-------|---------------|
| `expired` | `1` | "Your session has expired. Please sign in again." |
| `error` | `auth_failed` | "Sign-in failed. Please try again." |
| `error` | `access_denied` | "Sign-in was cancelled." |

---

## State Transitions

```
[No session]
    │
    │  User clicks "Sign in with Google"
    ▼
[Browser at Google consent] ──(denied)──► [LoginPage: error=access_denied]
    │
    │  User grants consent
    ▼
[AuthCallbackPage: setSession()]
    │
    │  Session stored
    ▼
[Authenticated] ──(401 response)──► [clearSession()] ──► [LoginPage: expired=1]
    │             ──(token exp)───► [clearSession()] ──► [LoginPage: expired=1]
    │
    │  User stays signed in within ~1 hour window
    ▼
[Session expires naturally] ──(next request or route change)──► [clearSession()] ──► [LoginPage: expired=1]
```
