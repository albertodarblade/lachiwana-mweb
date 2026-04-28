# Backend API Contract: Google SSO Login Page

**Feature**: `001-google-sso-login` | **Date**: 2026-04-28
**Backend repo**: `../Lachiwana-service` | **Base URL**: `${VITE_API_BASE_URL}/api/v1`

This document defines the backend API surface this feature depends on. All endpoints
are read from `../Lachiwana-service/src/modules/auth/` and
`../Lachiwana-service/src/modules/users/`.

---

## Auth Endpoints

### Initiate Google OAuth

```
GET /api/v1/auth/google
Access: Public (@Public decorator)
```

**Behaviour**: Passport intercepts and issues a `302 Found` redirect to Google's
accounts.google.com consent screen. This handler never returns a response body.

**Frontend usage**: Navigate the browser with `window.location.href = '${API_BASE}/api/v1/auth/google'`.

---

### Google OAuth Callback

```
GET /api/v1/auth/google/callback
Access: Public (@Public decorator)
```

**Current backend response** (JSON — for Swagger/API testing):

```json
{
  "success": true,
  "data": {
    "idToken": "eyJhbGci...",
    "user": {
      "googleId": "118392847362910293847",
      "email": "user@example.com",
      "name": "Jane Doe",
      "picture": "https://lh3.googleusercontent.com/...",
      "createdAt": "2026-04-28T12:00:00.000Z"
    }
  },
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

**⚠ Required backend enhancement** (prerequisite for SPA integration):
The handler must redirect the browser to the frontend callback route instead of
returning JSON. The backend must have `FRONTEND_URL` available as an env var.

Expected redirect target:

```
${FRONTEND_URL}/auth/callback?token=<idToken>&user=<base64url(JSON.stringify(user))>
```

On OAuth failure (user denies consent):

```
${FRONTEND_URL}/auth/callback?error=access_denied
```

**Error responses** (unchanged):

| Status | Condition |
|--------|-----------|
| 400 | User denied Google consent |
| 503 | Google token endpoint unreachable |

---

## Users Endpoints

All users endpoints require `Authorization: Bearer <idToken>`.

### List All Users

```
GET /api/v1/users
Access: Protected (requires valid Google ID Token)
```

**Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "googleId": "118392847362910293847",
      "email": "user@example.com",
      "name": "Jane Doe",
      "picture": "https://lh3.googleusercontent.com/...",
      "createdAt": "2026-04-28T12:00:00.000Z"
    }
  ],
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

**Error responses**:

| Status | Condition | Frontend action |
|--------|-----------|-----------------|
| 401 | Missing or invalid/expired token | Clear session → redirect to `/login?expired=1` |
| 503 | Google public key endpoint unreachable | Surface error to user; do not clear session |

---

## Authentication Mechanism

All protected endpoints expect:

```
Authorization: Bearer <Google ID Token JWT>
```

- Token type: Google ID Token (NOT an access token)
- Token lifetime: ~1 hour from issuance
- Verification: Server-side via `google-auth-library` (`OAuth2Client.verifyIdToken`)
- On expiry: Server returns `401 Unauthorized`; frontend must clear session and redirect

---

## Environment Variables Required

| Variable | Where used | Description |
|----------|------------|-------------|
| `VITE_API_BASE_URL` | Frontend `src/api/client.js` | Base URL of the backend (e.g., `http://localhost:3000`) |
| `FRONTEND_URL` | Backend env (prerequisite) | Frontend origin for OAuth redirect (e.g., `http://localhost:5173`) |
