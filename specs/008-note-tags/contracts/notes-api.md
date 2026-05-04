# API Contracts: Note Tags

> All endpoints require `Authorization: Bearer <token>`. No backend changes required — all fields already exist.

## Note Response (tags field)

`GET /notebooks/:notebookId/notes`, `GET /notebooks/:notebookId/notes/:noteId`, `POST /notebooks/:notebookId/notes`, `PATCH /notebooks/:notebookId/notes/:noteId` all return:

```json
{
  "id": "664f1a2b3c4d5e6f7a8b9c0d",
  "title": "My Note",
  "tags": ["664f..tag1", "664f..tag2"],
  "attachments": [],
  "createdAt": "2026-05-03T12:00:00.000Z",
  "updatedAt": "2026-05-03T12:00:00.000Z"
}
```

---

## Create Note (with tags)

`POST /notebooks/:notebookId/notes`

```json
// Request body
{
  "title": "My Note",
  "tags": ["664f..tag1", "664f..tag2"]
}
```

`tags` is optional — omit for a note with no tags.

---

## Update Note Tags

`PATCH /notebooks/:notebookId/notes/:noteId`

```json
// Request body (all fields optional)
{
  "tags": ["664f..tag1"]
}
```

Sends the **full replacement array**. To clear all tags: `{ "tags": [] }`.

---

## Tag Resolution (frontend only)

Tags are stored as IDs on the note. Resolution is done client-side:

```
note.tags.map(id => notebook.tags.find(t => t.id === id)).filter(Boolean)
```

No backend endpoint needed for resolution.
