# Research: Note Tags

## Decision 1: Backend Readiness

**Decision**: All backend endpoints already support note tags — no backend changes needed.
**Rationale**: `create-note.dto.ts` accepts optional `tags?: string[]`, `update-note.dto.ts` accepts optional `tags?: string[]`, and `note-response.dto.ts` returns `tags: string[]`. The note schema already has the field.
**Alternatives considered**: Adding dedicated tag endpoints per note — rejected; the full-array PATCH pattern is already established and sufficient.

---

## Decision 2: NoteTagPicker vs TagsPopup Reuse

**Decision**: Create a new `NoteTagPicker` component; do not reuse `TagsPopup`.
**Rationale**: `TagsPopup` manages notebook-level tag CRUD (create, edit, delete tags). `NoteTagPicker` selects from existing tags — a fundamentally different interaction (checkbox list, no forms). Sharing the same component would require complex mode logic with no shared rendering.
**Alternatives considered**: Extending `TagsPopup` with a `select-only` mode — rejected; the UX is different enough (list of checkboxes vs inline form for CRUD) that a shared component would become overly complex.

---

## Decision 3: Tag Chips in NoteCard — Data Resolution

**Decision**: Read notebook tags from TanStack Query cache inside `NoteCard` using `queryClient.getQueryData(['notebook', notebookId])`.
**Rationale**: `NotebookDetailPage` already fetches `['notebook', notebookId]`; its tags are in cache by the time NoteCard renders. This avoids prop drilling `notebookTags` through every list render, keeps NoteCard self-contained, and adds zero extra API calls.
**Alternatives considered**: Pass `notebookTags` as prop from `NotebookDetailPage` — rejected; adds prop surface to NoteCard for every parent that renders it.

---

## Decision 4: Tag Save Strategy on NoteDetailPage

**Decision**: Tags are saved immediately when the picker closes via a dedicated call to `updateNote(notebookId, noteId, { tags: selectedTagIds })`.
**Rationale**: `NoteDetailPage` auto-saves the title on debounce; there is no global "Save" button. Saving tags immediately on picker close is consistent with this auto-save philosophy and avoids unsaved changes being lost if the user navigates away.
**Alternatives considered**: Batching tag changes with the title save — rejected; title uses debounce (800ms), coupling tags to it would delay feedback and require reconciling two async save paths.

---

## Decision 5: useUpdateNote Extension

**Decision**: Extend the existing `useUpdateNote` hook to accept an optional `tags` field alongside `title`. No new hook needed.
**Rationale**: Both `title` and `tags` go to the same `PATCH /notes/:noteId` endpoint with the same optimistic update and cache invalidation pattern. A single hook handles both with no code duplication.
**Alternatives considered**: A separate `useUpdateNoteTags` hook — rejected; would duplicate the entire mutation scaffolding for a field that shares the same endpoint and cache keys.
