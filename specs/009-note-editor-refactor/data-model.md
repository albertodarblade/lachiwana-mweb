# Data Model: Note Editor Refactor

**Branch**: `009-note-editor-refactor` | **Date**: 2026-05-04

## API Entities (unchanged)

### Note

No backend changes in this feature. The `title` field carries markdown content as agreed in clarification Q5.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Immutable server-assigned ID |
| `title` | `string` | **Repurposed**: now stores raw markdown content. First line = display title. |
| `tags` | `string[]` | Array of tag IDs scoped to the parent notebook |
| `attachments` | `Attachment[]` | Legacy; inline images now inserted via `imagePlugin` |
| `createdAt` | `string` (ISO 8601) | Set by server on creation; displayed read-only at top of editor |
| `updatedAt` | `string` (ISO 8601) | Updated by server on each PATCH |

### Attachment (legacy, no changes)

Existing attachment records are not migrated or removed in this feature.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `string` | Server-assigned ID |
| `url` | `string` | Remote CDN URL |

---

## Frontend-Only State

### NoteEditorState (CreateNoteEditorPage)

| Field | Type | Description |
|-------|------|-------------|
| `noteId` | `string \| null` | Null until eager creation resolves |
| `content` | `string` | Raw markdown bound to MDXEditor |
| `selectedTagIds` | `string[]` | Currently selected tag IDs |
| `isSaving` | `boolean` | True during debounce window or in-flight PATCH |
| `justCreated` | `boolean` | True from mount until first edit; used for empty-note cleanup on unmount |

### NoteEditorState (NoteEditorPage / Edit)

| Field | Type | Description |
|-------|------|-------------|
| `content` | `string` | Initialised from `note.title`; bound to MDXEditor |
| `isSaving` | `boolean` | Saving indicator |
| `actionsOpen` | `boolean` | F7 Actions sheet for delete |
| `deleteOpen` | `boolean` | Delete confirmation sheet |

---

## Query Cache Keys (unchanged)

| Key | Data |
|-----|------|
| `['notes', notebookId]` | Note list for a notebook |
| `['note', notebookId, noteId]` | Single note detail |
| `['notebook', notebookId]` | Notebook detail (includes tags) |

Auto-save mutations invalidate `['note', notebookId, noteId]` and update `['notes', notebookId]` in-place (same as `useUpdateNote` today).

---

## Display Title Derivation

When rendering a note's title in `NoteCard` or other list views, the display title is extracted from the `note.title` (markdown) field by stripping markdown syntax from the first line:

```
rawTitle = note.title.split('\n')[0]
displayTitle = rawTitle.replace(/^#+\s*/, '').trim() || '(sin título)'
```

This extraction runs in the component layer (`NoteCard`) — no backend changes needed.
