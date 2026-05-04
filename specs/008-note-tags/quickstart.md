# Quickstart: Note Tags Implementation

## New Files

| File | Purpose |
|------|---------|
| `src/components/notes/NoteTagPicker.jsx` | Sheet picker: checkbox list of notebook tags, confirms with tag ID array |

## Modified Files

| File | Change |
|------|--------|
| `src/hooks/useUpdateNote.js` | Accept optional `tags` alongside `title`; include in optimistic data |
| `src/components/notes/CreateNotePopup.jsx` | Add `selectedTagIds` state + `NoteTagPicker` (local state mode) |
| `src/pages/NoteDetailPage.jsx` | Add tags section: chips row + "Gestionar etiquetas" button + `NoteTagPicker` (auto-save on close) |
| `src/components/notes/NoteCard.jsx` | Resolve tag chips from cache and render below note title |

## NoteTagPicker Props

```jsx
<NoteTagPicker
  notebookTags={Tag[]}          // available tags: [{ id, title, icon }]
  selectedTagIds={string[]}     // currently selected tag IDs
  onConfirm={(ids) => void}     // called with new selection on confirm/close
  opened={bool}
  onClose={() => void}
/>
```

No mode prop needed — the picker always just selects. The parent decides what to do with `onConfirm` (local state update vs API call).

## Tag Resolution in NoteCard

```js
import queryClient from '../../queryClient'

// Inside NoteCard({ note, notebookId })
const notebook = queryClient.getQueryData(['notebook', notebookId])
const notebookTags = notebook?.data?.tags ?? []
const resolvedTags = (note.tags ?? [])
  .map(id => notebookTags.find(t => t.id === id))
  .filter(Boolean)
```

## Auto-save Tags from NoteDetailPage

```js
const { mutate: updateNote } = useUpdateNote(notebookId, noteId)

function handleTagsConfirm(newTagIds) {
  updateNote({ tags: newTagIds })
  setTagPickerOpen(false)
}
```

## useUpdateNote Extension

```js
// Before:
mutationFn: ({ title }) => updateNote(notebookId, noteId, { title })
// After:
mutationFn: ({ title, tags }) => updateNote(notebookId, noteId, { ...(title !== undefined && { title }), ...(tags !== undefined && { tags }) })
```

Optimistic update must include `tags` in the cache update.

## NoteTagPicker Layout

```
┌────────────────────────────────────┐
│  ▬▬▬ (drag handle)                │
│  Etiquetas del cuaderno            │
├────────────────────────────────────┤
│  ☑  🔴 Urgente                    │  ← selected
│  ☐  💼 Trabajo                    │  ← unselected
│  ☑  ⭐ Favorito                   │  ← selected
├────────────────────────────────────┤
│         [  Listo  ]               │
└────────────────────────────────────┘
```
