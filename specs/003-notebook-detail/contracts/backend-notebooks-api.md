# Backend API Contract: Notebook Detail View

**Feature**: `003-notebook-detail` | **Date**: 2026-04-29
**Backend repo**: `../Lachiwana-service` | **Base URL**: `${LACHIWANA_SERVICE_URL}/api/v1`

All endpoints require `Authorization: Bearer <token>`.

---

## Update Notebook

```
PATCH /api/v1/notebooks/:id
Access: Protected — owner OR member
Content-Type: application/json
```

All body fields are optional. Only provided fields are changed.

**Request body** (any subset):
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "color": "#34C759",
  "iconName": "star_fill",
  "users": ["member-google-id-1"]
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "664f1a2b3c4d5e6f7a8b9c0d",
    "title": "Updated Title",
    "description": "Updated description",
    "color": "#34C759",
    "iconName": "star_fill",
    "owner": "105209993105172258545",
    "users": ["member-google-id-1"],
    "createdAt": "2026-04-28T12:00:00.000Z",
    "updatedAt": "2026-04-29T10:00:00.000Z"
  },
  "timestamp": "2026-04-29T10:00:00.000Z"
}
```

**Error responses**:

| Status | Condition | Frontend action |
|--------|-----------|-----------------|
| 400 | Invalid body (e.g., empty title) | Show toast error; restore optimistic rollback |
| 401 | Invalid/expired token | API client clears session → `/login?expired=1` |
| 403 | Caller is not owner or member | Show toast error; restore optimistic rollback |
| 404 | Notebook not found | Show toast error; navigate back to list |

---

## Delete Notebook

```
DELETE /api/v1/notebooks/:id
Access: Protected — owner only
```

No request body. Returns 204 No Content on success.

**Response** (204 No Content): Empty body.

**Error responses**:

| Status | Condition | Frontend action |
|--------|-----------|-----------------|
| 401 | Invalid/expired token | API client clears session → `/login?expired=1` |
| 403 | Caller is not the owner | Show toast error; dismiss dialog; list unchanged |
| 404 | Notebook not found | Show toast error; navigate back to list |

---

## Notes

- `PATCH` replaces the `users` array in full — partial member updates are not supported.
  The frontend must send the complete desired member list.
- The `owner` field cannot be changed via `PATCH` — it is silently ignored if provided.
- Deletion is permanent; there is no soft-delete or recycle bin.
