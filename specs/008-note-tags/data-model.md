# Data Model: Note Tags

## Entities

### Note (augmented shape)

The existing Note response shape gains a resolved `tags` field visible to the frontend:

```
Note {
  id: string
  title: string
  tags: string[]        ← array of notebook tag IDs already in backend
  attachments: Attachment[]
  createdAt: Date
  updatedAt: Date
}
```

`tags` is an array of ID strings referencing `Tag` objects defined on the parent `Notebook`. The note does not embed tag title/icon — those are resolved at render time from the notebook's tag collection.

### Tag Resolution at Render Time

```
note.tags: string[]  +  notebook.tags: Tag[]
         ↓
resolved: Tag[]  (filter notebook.tags where id ∈ note.tags)
```

Tags that exist in `note.tags` but not in `notebook.tags` (stale references after a notebook tag is deleted) are silently ignored.

## State Transitions

### Create Flow

```
[] ──picker open──> toggle selections ──picker close──> selectedTagIds: string[]
                                                              ↓
                                              form submit → POST /notes (tags: selectedTagIds)
```

All tag selections are in local state until the creation form is submitted.

### Edit Flow (NoteDetailPage)

```
note.tags: string[]
  ↓ picker opens (pre-populates from note.tags)
  ↓ user toggles tags
  ↓ picker closes → PATCH /notes/:id { tags: newTagIds }
                  → optimistic update ['note', notebookId, noteId]
                  → on settle: invalidate ['note', notebookId, noteId] + ['notes', notebookId]
```

Each picker close triggers one PATCH call — no per-selection API calls.

## Query Cache Keys

| Key | Shape | Affected by note tag mutations |
|-----|-------|-------------------------------|
| `['note', notebookId, noteId]` | `{ data: Note }` | Optimistically updated |
| `['notes', notebookId]` | `{ data: Note[] }` | Marked stale on settle |
| `['notebook', notebookId]` | `{ data: Notebook }` | Read-only source for available tags |

## Validation Rules

| Field | Rule | Where enforced |
|-------|------|----------------|
| tags | Array of strings (may be empty) | No frontend validation needed — all-or-nothing selection |
| tags items | Must be valid IDs from the notebook's tag list | Enforced implicitly by only offering valid IDs in the picker |
