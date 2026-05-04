# API Contracts: Notebook Tags

> All endpoints require `Authorization: Bearer <token>`. Base path: `/api/v1`.

## Notebook Response (augmented)

`GET /notebooks`, `GET /notebooks/:id`, `POST /notebooks`, `PATCH /notebooks/:id` all return:

```json
{
  "id": "664f1a2b3c4d5e6f7a8b9c0d",
  "title": "My Notebook",
  "description": null,
  "color": "#007AFF",
  "iconName": "book",
  "owner": "105209993105172258545",
  "users": [],
  "tags": [
    { "id": "664f1a2b3c4d5e6f7a8b9c10", "title": "Urgente", "icon": "flag_fill" },
    { "id": "664f1a2b3c4d5e6f7a8b9c11", "title": "Trabajo",  "icon": "briefcase_fill" }
  ],
  "createdAt": "2026-05-03T12:00:00.000Z",
  "updatedAt": "2026-05-03T12:00:00.000Z"
}
```

**Backend change required**: `NotebookResponseDto` must expose the `tags` array. Currently omitted.

---

## Create Notebook (with tags)

`POST /notebooks`

```json
// Request body
{
  "title": "My Notebook",
  "tags": [
    { "title": "Urgente", "icon": "flag_fill" },
    { "title": "Trabajo",  "icon": "briefcase_fill" }
  ]
}
```

**Backend change required**: `CreateNotebookDto` must accept optional `tags` array.

---

## Add Tag

`POST /notebooks/:notebookId/tags`

```json
// Request body
{ "title": "Urgente", "icon": "flag_fill" }

// Response 201
{ "id": "664f...", "title": "Urgente", "icon": "flag_fill" }
```

**Backend change required**: New endpoint.

---

## Update Tag

`PATCH /notebooks/:notebookId/tags/:tagId`

```json
// Request body (all fields optional)
{ "title": "Muy urgente", "icon": "exclamationmark_triangle_fill" }

// Response 200
{ "id": "664f...", "title": "Muy urgente", "icon": "exclamationmark_triangle_fill" }
```

**Backend change required**: New endpoint.

---

## Delete Tag

`DELETE /notebooks/:notebookId/tags/:tagId`

```
Response: 204 No Content
```

**Backend change required**: New endpoint.

---

## Error Responses (all tag endpoints)

| Status | Condition |
|--------|-----------|
| 400    | Missing or invalid `title`/`icon` |
| 401    | Missing or invalid Bearer token |
| 403    | Caller is not owner or member of the notebook |
| 404    | Notebook or tag not found |
