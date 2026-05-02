# Backend API Contract: Notes & Attachments

**Feature**: `004-notes-attachments` | **Date**: 2026-05-02
**Base URL**: `${LACHIWANA_SERVICE_URL}/api/v1`
**Auth**: All endpoints require `Authorization: Bearer <token>`

---

## Notes

### List Notes
```
GET /api/v1/notebooks/:notebookId/notes
```
Returns all notes in the notebook. Caller must be owner or member.

**Response (200)**:
```json
{ "success": true, "data": [{ "id": "...", "title": "Meeting Notes", "attachments": [], "createdAt": "...", "updatedAt": "..." }], "timestamp": "..." }
```

### Create Note
```
POST /api/v1/notebooks/:notebookId/notes
Content-Type: application/json
Body: { "title": "Meeting Notes" }
```

**Response (201)**:
```json
{ "success": true, "data": { "id": "...", "title": "Meeting Notes", "attachments": [], "createdAt": "...", "updatedAt": "..." }, "timestamp": "..." }
```

| Status | Condition | Frontend action |
|--------|-----------|-----------------|
| 400 | Empty title | Show validation error; block submit |
| 403 | Not owner/member | Show toast error |
| 404 | Notebook not found | Show toast; navigate back |

### Get Note
```
GET /api/v1/notebooks/:notebookId/notes/:noteId
```
Returns single note with embedded attachments.

### Update Note
```
PATCH /api/v1/notebooks/:notebookId/notes/:noteId
Content-Type: application/json
Body: { "title": "Updated Title" }
```
Called automatically by the auto-save debounce. **Response (200)**: updated Note.

| Status | Condition | Frontend action |
|--------|-----------|-----------------|
| 403 | Not owner/member | Show toast; restore previous title |

### Delete Note
```
DELETE /api/v1/notebooks/:notebookId/notes/:noteId
```
Deletes the note AND all its embedded attachments. **Response (204)**: no content.

| Status | Condition | Frontend action |
|--------|-----------|-----------------|
| 403 | Not owner/member | Show toast; keep dialog open for retry |
| 404 | Note not found | Navigate back to notebook |

---

## Attachments

### Upload Attachment
```
POST /api/v1/notebooks/:notebookId/notes/:noteId/attachments
Content-Type: multipart/form-data
Body: FormData with field "file" (binary)
```

**Response (201)**:
```json
{ "success": true, "data": { "id": "...", "uploadedBy": { "name": "Jane", "src": "https://..." }, "uploadedDate": "...", "fileSrcId": "BQACAgIA..." }, "timestamp": "..." }
```

| Status | Condition | Frontend action |
|--------|-----------|-----------------|
| 502 | Telegram upload failed | Show toast; reset upload control |

### List Attachments
```
GET /api/v1/notebooks/:notebookId/notes/:noteId/attachments
```
Returns all attachment records for the note. (Note detail already embeds them; this endpoint is available for standalone refresh.)

### Delete Attachment
```
DELETE /api/v1/notebooks/:notebookId/notes/:noteId/attachments/:attachId
```
Removes the attachment record. **Response (204)**: no content.

---

## Files

```
GET /api/v1/files/:fileSrcId
Authorization: Bearer <token>
```

Streams the file binary with the correct `Content-Type` header. The `Content-Type`
header is used client-side to distinguish images (`image/*`) from other file types.

**⚠ Auth required**: This endpoint requires a Bearer token. The app MUST fetch this
endpoint via the authenticated API layer and render files using data URLs (not direct
`<img src>`).

| Status | Condition |
|--------|-----------|
| 200 | File streamed with Content-Type |
| 404 | fileSrcId not found in Telegram |
| 502 | Telegram unreachable |
