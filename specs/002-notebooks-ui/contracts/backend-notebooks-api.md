# Backend API Contract: Notebooks UI

**Feature**: `002-notebooks-ui` | **Date**: 2026-04-28
**Backend repo**: `../Lachiwana-service` | **Base URL**: `${LACHIWANA_SERVICE_URL}/api/v1`

All endpoints require `Authorization: Bearer <token>` (service-signed JWT).

---

## List Notebooks

```
GET /api/v1/notebooks
Access: Protected
```

Returns all notebooks the caller owns or is a member of.

**Response** (200 OK):
```json
{
  "success": true,
  "data": [
    {
      "id": "664f1a2b3c4d5e6f7a8b9c0d",
      "title": "My Notebook",
      "description": "Project notes",
      "color": "#007AFF",
      "iconName": "book",
      "owner": "105209993105172258545",
      "users": ["other-google-id"],
      "createdAt": "2026-04-28T12:00:00.000Z",
      "updatedAt": "2026-04-28T12:00:00.000Z"
    }
  ],
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

**Error responses**:

| Status | Condition | Frontend action |
|--------|-----------|-----------------|
| 401 | Invalid/expired token | API client clears session → `/login?expired=1` |

---

## Create Notebook

```
POST /api/v1/notebooks
Access: Protected
Content-Type: application/json
```

Creates a notebook. `owner` is set automatically from the JWT — do NOT include it in the body.

**Request body**:
```json
{
  "title": "My Notebook",
  "description": "Optional description",
  "color": "#007AFF",
  "iconName": "book",
  "users": ["member-google-id-1", "member-google-id-2"]
}
```

Only `title` is required. All other fields are optional.

**Response** (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "title": "My Notebook",
    "description": "Optional description",
    "color": "#007AFF",
    "iconName": "book",
    "owner": "105209993105172258545",
    "users": ["member-google-id-1"],
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-28T12:00:00.000Z"
  },
  "timestamp": "2026-04-28T12:00:00.000Z"
}
```

**Error responses**:

| Status | Condition | Frontend action |
|--------|-----------|-----------------|
| 400 | Invalid body (empty title) | Show inline validation error; preserve form |
| 401 | Invalid/expired token | API client clears session → `/login?expired=1` |

---

## Users Endpoint (reused for MemberPicker)

```
GET /api/v1/users
Access: Protected
```

Returns all registered users. Used to populate the MemberPicker. The current user
(owner) MUST be excluded from the displayed list client-side.

**Response shape**: see `contracts/backend-auth-api.md` from feature 001.

---

## Notes

- The `owner` field is immutable after creation; it is set server-side from the JWT.
- `users` contains GoogleIds (not names/emails); the frontend resolves display info
  by joining with the users list from `GET /api/v1/users`.
- The response wrapping is `{ success, data, timestamp }` applied by the global
  `ResponseInterceptor`. Frontend reads `response.data` for the payload.
