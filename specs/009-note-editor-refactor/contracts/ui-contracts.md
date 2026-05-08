# UI Contracts: Note Editor Refactor

**Branch**: `009-note-editor-refactor` | **Date**: 2026-05-04

---

## Route: Create Note Editor

**Path**: `/notebooks/:notebookId/notes/create`  
**Component**: `CreateNoteEditorPage`  
**Auth**: Protected (ProtectedRoute wrapper)

### Props (via f7route)

| Param | Source | Description |
|-------|--------|-------------|
| `notebookId` | `f7route.params.notebookId` | Parent notebook ID |

### Layout Contract

```
┌─────────────────────────────────────────┐
│ [← Atrás]     Nota Nueva                │  ← Navbar (F7)
├─────────────────────────────────────────┤
│  [Tag chips row]  [+ Agregar etiquetas] │  ← Header zone (top)
│  Creado: 04 may 2026                    │
├─────────────────────────────────────────┤
│                                         │
│   MDXEditor (contenteditable)           │  ← Flex-grows to fill
│   (auto-focus on mount)                 │
│                                         │
├─────────────────────────────────────────┤
│ [↩][↪] [B][I][U] [<>] [1.][✓] [img]   │  ← Toolbar (fixed bottom)
└─────────────────────────────────────────┘
```

### Behaviour Contract

| Trigger | Behaviour |
|---------|-----------|
| Page mount | Eagerly call `createNote({ title: '', tags: [] })`; store returned `noteId` |
| User types | Start 800ms debounce; on fire call `updateNote({ title: content })` |
| User changes tags | Immediately call `updateNote({ tags: selectedTagIds })` |
| User taps insert-image | `imageUploadHandler` fires; image embedded at cursor as `![](url)` |
| User navigates back (back button / swipe) | Flush any pending debounce save; if content is still empty, delete the note before leaving |
| Saving in-flight | Show subtle "Guardando…" indicator near top-right |

### Mutations Used

| Mutation | Hook | Purpose |
|----------|------|---------|
| Create note | `useCreateNote(notebookId)` | Eager creation on mount |
| Update note content | `useUpdateNote(notebookId, noteId)` | Debounced auto-save |
| Upload image | `uploadAttachmentsSequentially` / `uploadAttachment` | Per-image on insert |
| Delete empty note | `useDeleteNote(notebookId, noteId)` | Clean up if abandoned empty |

---

## Route: Edit Note Editor

**Path**: `/notebooks/:notebookId/notes/:noteId`  
**Component**: `NoteEditorPage` _(replaces `NoteDetailPage`)_  
**Auth**: Protected (ProtectedRoute wrapper)

### Props (via f7route)

| Param | Source | Description |
|-------|--------|-------------|
| `notebookId` | `f7route.params.notebookId` | Parent notebook ID |
| `noteId` | `f7route.params.noteId` | Note being edited |

### Layout Contract

```
┌─────────────────────────────────────────┐
│ [← Atrás]     Nota          [⋯ menu]   │  ← Navbar (F7); ⋯ opens Actions
├─────────────────────────────────────────┤
│  [Tag chip] [Tag chip]  [+ Gestionar]   │  ← Header zone (top)
│  Creado: 04 may 2026                    │
├─────────────────────────────────────────┤
│                                         │
│   MDXEditor (contenteditable)           │  ← Flex-grows to fill
│   (initialised with note.title)         │
│                                         │
├─────────────────────────────────────────┤
│ [↩][↪] [B][I][U] [<>] [1.][✓] [img]   │  ← Toolbar (fixed bottom)
└─────────────────────────────────────────┘
```

### Behaviour Contract

| Trigger | Behaviour |
|---------|-----------|
| Page mount | Load note via `useNote`; initialise MDXEditor with `note.title` |
| User types | 800ms debounce; on fire call `updateNote({ title: content })` |
| User changes tags | Immediately call `updateNote({ tags: selectedTagIds })` |
| User taps insert-image | `imageUploadHandler` fires; uploads and embeds URL inline |
| User taps ⋯ menu | Open F7 Actions sheet with "Eliminar nota" action |
| User confirms delete | Run delete with countdown; navigate back to `/notebooks/:notebookId` |
| Saving in-flight | Show "Guardando…" indicator |

### Mutations Used

| Mutation | Hook | Purpose |
|----------|------|---------|
| Update note content | `useUpdateNote(notebookId, noteId)` | Debounced auto-save |
| Update tags | `useUpdateNote(notebookId, noteId)` | Immediate on tag change |
| Upload image | `uploadAttachment` | Per-image on insert |
| Delete note | `useDeleteNote(notebookId, noteId)` | Via actions menu |

---

## Component: NoteEditor (shared)

**File**: `src/components/notes/NoteEditor.jsx`

```
Props:
  initialContent: string          — initial markdown ('' for create, note.title for edit)
  onContentChange: (md) => void   — called on every editor change
  imageUploadHandler: async (file: File) => string
  className?: string
```

Renders MDXEditor with `listsPlugin`, `imagePlugin`, `toolbarPlugin`. Toolbar fixed to bottom via `toolbarClassName="note-editor-bottom-toolbar"`.

---

## NoteCard Display Title (updated)

`NoteCard` extracts the display title from `note.title` (markdown):
1. Take the first non-empty line
2. Strip leading `#` heading markers and surrounding whitespace
3. Fall back to `'(sin título)'` if result is empty
