# Data Model: Notes & Attachments

**Feature**: `004-notes-attachments` | **Date**: 2026-05-02

---

## Note (server-side entity)

Fetched from `GET /api/v1/notebooks/:notebookId/notes` (list) and
`GET /api/v1/notebooks/:notebookId/notes/:noteId` (detail).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | MongoDB ObjectId |
| `title` | `string` | Required, non-empty. Only editable text field. |
| `attachments` | `Attachment[]` | Embedded array; may be empty |
| `createdAt` | `string` | ISO 8601 |
| `updatedAt` | `string` | ISO 8601; used for display sort order |

**Sort order**: Descending by `createdAt` (newest first) on the notes list.

---

## Attachment (embedded in Note)

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | MongoDB ObjectId |
| `uploadedBy` | `{ name: string, src: string }` | Uploader identity from JWT at upload time |
| `uploadedDate` | `string` | ISO 8601 timestamp |
| `fileSrcId` | `string` | Telegram file_id; pass to `GET /api/v1/files/:fileSrcId` |

**No filename or MIME type stored.** File type is determined at render time from the
`Content-Type` header returned by the file endpoint.

---

## Resolved File (client-side only, cached in TanStack Query)

Produced by `useBlobUrl(fileSrcId)`.

| Field | Type | Notes |
|-------|------|-------|
| `dataUrl` | `string` | Base64 data URL (`data:<mimeType>;base64,...`) |
| `mimeType` | `string` | MIME type from `Content-Type` response header |
| `isImage` | `boolean` | Derived: `mimeType.startsWith('image/')` |

---

## CreateNotePayload

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | Non-empty string |

---

## UpdateNotePayload

| Field | Required | Notes |
|-------|----------|-------|
| `title` | No | Optional; only editable field |

---

## UploadAttachmentPayload

Sent as `multipart/form-data` with a single `file` field.

| Field | Required | Notes |
|-------|----------|-------|
| `file` | Yes | Binary file content |

---

## NoteDetailPage Local State

| State | Type | Description |
|-------|------|-------------|
| `title` | `string` | Local controlled value for the title input |
| `isSaving` | `boolean` | True while debounced mutation is in flight |
| `deleteDialogOpen` | `boolean` | Controls the 5-second countdown delete dialog |
| `debounceTimerRef` | `Ref<number>` | Ref holding the debounce timer ID |

---

## Query Key Map

| Query Key | Data Shape | Invalidated by |
|-----------|------------|----------------|
| `['notes', notebookId]` | `{ data: Note[], ... }` | createNote, deleteNote (immediate); updateNote, uploadAttachment, deleteAttachment (refetchType: none) |
| `['note', notebookId, noteId]` | `{ data: Note, ... }` | updateNote, uploadAttachment, deleteAttachment (immediate) |
| `['file', fileSrcId]` | `{ dataUrl, mimeType, isImage }` | Never (staleTime: Infinity) |
