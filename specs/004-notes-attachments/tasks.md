# Tasks: Notes & Attachments

**Input**: Design documents from `/specs/004-notes-attachments/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/backend-notes-api.md ✓, quickstart.md ✓

**Tests**: No test tasks — Principle IX (no unit tests) confirmed in plan.md and spec.

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1–US5)
- All file paths are relative to repository root

---

## Phase 1: Setup

**Purpose**: No new project-level setup needed — this is a new feature in an existing React/F7 project. Proceed to Foundational phase.

*(Skipped — no new tooling, dependencies, or configuration required)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API layer required by ALL user story hooks. Must complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T001 Update src/api/client.js — add `getBlob(path)` helper (fetch with `Authorization: Bearer` header, return `response.blob()`; handle 401 identical to existing `get()`) and `postForm(path, formData)` helper (multipart/form-data POST with auth header, do NOT set `Content-Type` manually so browser sets boundary, return `response.json()` on success; handle 401 identical to existing `post()`)
- [x] T002 Create src/api/notes.js — implement and export: `listNotes(notebookId)` → GET `/api/v1/notebooks/:notebookId/notes`; `createNote(notebookId, payload)` → POST JSON; `getNote(notebookId, noteId)` → GET single note with attachments; `updateNote(notebookId, noteId, payload)` → PATCH JSON; `deleteNote(notebookId, noteId)` → DELETE (204); `uploadAttachment(notebookId, noteId, formData)` → POST multipart via `postForm`; `deleteAttachment(notebookId, noteId, attachId)` → DELETE (204)

**Checkpoint**: API layer ready — all hook implementations can now proceed.

---

## Phase 3: User Story 1 — View Notes List in Notebook (Priority: P1) 🎯 MVP

**Goal**: Replace the static "Notas vacías" placeholder in NotebookDetailPage with a live, scrollable list of notes and a "Nueva Nota" FAB.

**Independent Test**: Open a notebook detail → notes list renders with existing notes (each card shows title + attachment count) → empty-state message shown for notebooks with no notes → "Nueva Nota" FAB always visible.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create src/hooks/useNotes.js — `useQuery` with key `['notes', notebookId]`; `queryFn` calls `listNotes(notebookId)`; `enabled: !!notebookId`; returns notes sorted by `createdAt` descending as received from the API
- [x] T004 [P] [US1] Create src/components/notes/NoteCard.jsx — F7 `ListItem` rendering `note.title` as the item title and attachment count (`note.attachments.length`) as a badge or subtitle; tapping navigates to `/notebooks/:notebookId/notes/:noteId` via `f7navigate`
- [x] T005 [P] [US1] Create src/components/notes/NoteEmptyState.jsx — centered empty-state block with a message prompting the user to create the first note; no interactive controls (FAB handles creation)
- [x] T006 [US1] Update src/pages/NotebookDetailPage.jsx — import `useNotes`, `NoteCard`, `NoteEmptyState`; replace the "Notas vacías" static placeholder with: `useNotes(notebookId)` hook call, Preloader while `isPending`, conditional render of `NoteEmptyState` when `notes.length === 0`, error state with retry when `isError`, F7 `List` of `NoteCard` items otherwise; add F7 `Fab` that navigates to `/notebooks/:notebookId/notes/create` (depends on T003, T004, T005)

**Checkpoint**: US1 complete — notebook detail shows live notes list and FAB. Independent test passing.

---

## Phase 4: User Story 2 — Create a Note (Priority: P2)

**Goal**: Note creation form reachable from the FAB — title required, optional image attachment. Optimistic insert into notes list on submit. Navigate to the real note's detail page after server confirms.

**Independent Test**: Tap "Nueva Nota" → creation form renders → submit with empty title blocked with validation message → enter title → optionally attach an image → submit → navigated to `/notebooks/:id/notes/:noteId` → note appears in the notebook's notes list on back navigation.

### Implementation for User Story 2

- [x] T007 [P] [US2] Create src/hooks/useCreateNote.js — `useMutation` calling `createNote(notebookId, { title })`; `onMutate`: cancel `['notes', notebookId]`, snapshot, prepend optimistic entry `{ id: 'temp-${Date.now()}', title, attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }`; `onError`: restore snapshot; `onSuccess`: if images were queued, call `uploadAttachment` for each before navigating (navigation callback passed in by the page); `onSettled`: invalidate `['notes', notebookId]`
- [x] T008 [P] [US2] Create src/hooks/useUploadAttachment.js — `useMutation` calling `uploadAttachment(notebookId, noteId, formData)`; non-optimistic; `onSettled`: invalidate `['note', notebookId, noteId]` immediately; expose `isPending` for upload loading state (this hook is also reused by AttachmentGallery in US4)
- [x] T009 [US2] Create src/pages/CreateNotePage.jsx — F7 `Page` with `Navbar` ("Nueva Nota"); F7 `List` containing: title `ListInput` (required, `onInput` updates local state), image file `<input type="file" accept="image/*" multiple>` triggered by an F7 `Button`; client-side validation: block submit and show inline error when title is empty; on valid submit: call `useCreateNote` mutation with title and selected image files (create FormData per image for sequential uploads in `onSuccess`); show loading state on submit `Button` while mutation is `isPending` (depends on T007, T008)
- [x] T010 [US2] Update src/App.jsx — add `ProtectedRoute` for `/notebooks/:notebookId/notes/create` → `CreateNotePage`; this route MUST be registered before the dynamic `:noteId` route to prevent "create" matching as a noteId (research.md decision) (depends on T009)

**Checkpoint**: US2 complete — note creation flow works end-to-end with optional image upload. Independent test passing.

---

## Phase 5: User Story 3 — Edit Note Title (Auto-Save) (Priority: P3)

**Goal**: NoteDetailPage with an editable title that auto-saves 800ms after the user stops typing. Visible "Guardando…" indicator while saving. Toast error on failure with the title field retaining the unsaved value.

**Independent Test**: Open a note → edit title → stop typing → "Guardando…" indicator appears within 1 second → indicator disappears → navigate back → updated title shows in the note card.

### Implementation for User Story 3

- [x] T011 [P] [US3] Create src/hooks/useNote.js — `useQuery` with key `['note', notebookId, noteId]`; `queryFn` calls `getNote(notebookId, noteId)`; `enabled: !!notebookId && !!noteId`
- [x] T012 [P] [US3] Create src/hooks/useUpdateNote.js — `useMutation` calling `updateNote(notebookId, noteId, { title })`; `onMutate`: cancel `['note', notebookId, noteId]`, snapshot, optimistically set title in cached note; `onError`: restore snapshot, show F7 toast with error message; `onSettled`: invalidate `['note', notebookId, noteId]` immediately, invalidate `['notes', notebookId]` with `refetchType: 'none'` (marks list stale without triggering a background fetch)
- [x] T013 [US3] Create src/pages/NoteDetailPage.jsx — F7 `Page` with `Navbar` (back to notebook, title "Nota", delete action placeholder for US5); local state: `title` string (initialized from `useNote` data), `isSaving` boolean, `debounceTimerRef` via `useRef`; title `ListInput` with `onInput` handler: update `title` state immediately, clear pending debounce timer, set new 800ms timer that sets `isSaving=true` and calls `useUpdateNote` mutate, reset `isSaving=false` in `onSettled`; render "Guardando…" small text near title field when `isSaving` is true; show F7 toast on `onError`; no attachment gallery yet (added in US4) (depends on T011, T012)
- [x] T014 [US3] Update src/App.jsx — add `ProtectedRoute` for `/notebooks/:notebookId/notes/:noteId` → `NoteDetailPage` AFTER the `/notes/create` route so the static "create" segment is matched first (depends on T013)

**Checkpoint**: US3 complete — auto-save title with debounce and saving indicator works. Independent test passing.

---

## Phase 6: User Story 4 — Manage Attachments (Priority: P4)

**Goal**: Full attachment gallery integrated into NoteDetailPage — images as authenticated thumbnails (data URLs via `useBlobUrl`) with F7 PhotoBrowser for fullscreen, non-image files as placeholder + "Descargar" download button, upload any file type, optimistic attachment deletion with simple confirm.

**Independent Test**: Open a note with mixed attachments → images show as thumbnails, non-images show file placeholder + "Descargar" → tap image → PhotoBrowser fullscreen opens with swipe navigation → tap "Agregar archivo" → file picker → upload completes → file appears in gallery → tap delete on attachment → simple confirmation → attachment disappears from gallery immediately (optimistic).

### Implementation for User Story 4

- [x] T015 [P] [US4] Create src/hooks/useBlobUrl.js — `useQuery` with key `['file', fileSrcId]`, `staleTime: Infinity`, `enabled: !!fileSrcId`; `queryFn`: call `getBlob('/api/v1/files/' + fileSrcId)` → returns a `Blob`; read with `FileReader.readAsDataURL` (wrap in a Promise); resolve `{ dataUrl: string, mimeType: blob.type, isImage: blob.type.startsWith('image/') }`
- [x] T016 [P] [US4] Create src/hooks/useDeleteAttachment.js — `useMutation` calling `deleteAttachment(notebookId, noteId, attachId)`; `onMutate`: cancel both `['note', notebookId, noteId]` and `['notes', notebookId]`, snapshot both, optimistically filter out the attachment from both caches; `onError`: restore both snapshots, show F7 toast; `onSettled`: invalidate `['note', notebookId, noteId]` immediately, invalidate `['notes', notebookId]` with `refetchType: 'none'`
- [x] T017 [P] [US4] Create src/components/notes/AttachmentItem.jsx — receives `attachment` object, `notebookId`, `noteId`, `onImageTap(index)` callback; calls `useBlobUrl(attachment.fileSrcId)`; while loading: render F7 `Preloader` in thumbnail slot; when `isImage`: render `<img src={dataUrl}>` thumbnail, call `onImageTap` on tap; when not image: render file-type icon placeholder + "Descargar" `Button` (onClick: call `getBlob` on demand → `URL.createObjectURL` → programmatic `<a download="archivo-${attachment.id}">` click → `URL.revokeObjectURL` immediately); delete icon `Button` shows F7 `Dialog` confirm/cancel (no countdown) → on confirm calls `useDeleteAttachment`
- [x] T018 [US4] Create src/components/notes/AttachmentGallery.jsx — receives `notebookId`, `noteId`, `attachments` array; renders grid of `AttachmentItem`; collects resolved `dataUrl` values from image-type attachments for F7 `PhotoBrowser` `photos` prop; `PhotoBrowser` opened via `ref.current.open(imageIndex)` when an image thumbnail is tapped; hidden `<input type="file">` triggered by visible "Agregar archivo" `Button`; on file selection: build `FormData` with `file` field, call `useUploadAttachment` (imported from US2); show loading state on "Agregar archivo" button while `isPending` (depends on T015, T016, T017, and `useUploadAttachment` from T008)
- [x] T019 [US4] Update src/pages/NoteDetailPage.jsx — import and render `AttachmentGallery` below the title `ListInput`, passing `notebookId`, `noteId`, and `note.attachments` from `useNote` data (depends on T018)

**Checkpoint**: US4 complete — full attachment gallery with upload, fullscreen, download, and optimistic deletion. Independent test passing.

---

## Phase 7: User Story 5 — Delete a Note (Priority: P5)

**Goal**: Delete action on NoteDetailPage triggers non-optimistic note deletion behind a 5-second countdown confirmation dialog (identical pattern to notebook delete). Navigate back to the notebook on success. Toast error on failure with dialog staying open for retry.

**Independent Test**: Open a note → tap delete → dialog opens with confirm button disabled + visible 5-second countdown → countdown reaches 0 → confirm button enables → tap confirm → navigate back to `/notebooks/:notebookId` → note is gone from the list.

### Implementation for User Story 5

- [x] T020 [US5] Create src/hooks/useDeleteNote.js — `useMutation` calling `deleteNote(notebookId, noteId)`; non-optimistic (no `onMutate` cache changes); `onSuccess`: call `navigate('/notebooks/:notebookId')` (navigation callback passed in by the page), invalidate `['notes', notebookId]`; `onError`: show F7 toast error (dialog remains open for retry)
- [x] T021 [US5] Update src/pages/NoteDetailPage.jsx — add delete icon/button to `Navbar` right slot; implement delete confirmation using F7 `Sheet` or `Actions`: open on delete tap, show 5-second countdown with the same `useCountdown` pattern used in the notebook delete dialog, keep confirm `Button` disabled until countdown reaches 0, on confirm call `useDeleteNote` mutate, on cancel close dialog without action; apply `isPending` loading state to confirm button while mutation is in flight (depends on T020)

**Checkpoint**: US5 complete — note deletion with 5-second countdown confirmation works. Independent test passing.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Error edge cases, defensive checks, and end-to-end validation.

- [x] T022 [P] Add error state with retry to src/pages/NotebookDetailPage.jsx — handle `useNotes` `isError` state by rendering an error message with a retry `Button` in the notes area instead of the list/empty-state
- [x] T023 [P] Verify route ordering and protection in src/App.jsx — confirm `/notebooks/:notebookId/notes/create` is registered before `/notebooks/:notebookId/notes/:noteId`; confirm both routes are wrapped with `ProtectedRoute`; verify no route collisions
- [ ] T024 Run quickstart.md validation scenarios end-to-end — US1 through US5 in order; verify performance goals: SC-001 notes list renders < 1s, SC-003 auto-save triggers < 1s after pause, SC-005 gallery thumbnails visible < 2s after note opens

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately. **BLOCKS all user story phases**
- **US1 (Phase 3)**: Depends on Phase 2 completion
- **US2 (Phase 4)**: Depends on Phase 2 completion; US1 should be complete first (FAB navigates to the create route)
- **US3 (Phase 5)**: Depends on Phase 2 completion; US1 + US2 recommended first (NoteDetailPage is the target of NoteCard taps and navigation after creation)
- **US4 (Phase 6)**: Depends on Phase 2 + **US3** (AttachmentGallery is integrated into NoteDetailPage created in US3)
- **US5 (Phase 7)**: Depends on Phase 2 + **US3** (delete action is added to NoteDetailPage created in US3)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Can start immediately after Phase 2 — no story dependencies
- **US2 (P2)**: Can start after Phase 2 — independent of US1 (FAB from US1 is the natural entry point but not required)
- **US3 (P3)**: Can start after Phase 2 — independent of US1/US2 (NoteDetailPage is a new standalone page)
- **US4 (P4)**: Depends on **US3** — `AttachmentGallery` is integrated into `NoteDetailPage`
- **US5 (P5)**: Depends on **US3** — delete action is added to `NoteDetailPage`

### Within Each User Story

- Tasks marked `[P]` within a story (hooks, isolated components) can be implemented simultaneously
- Page/integration tasks depend on their `[P]` prerequisites within the same story
- App.jsx route additions always depend on the page component being ready

### Parallel Opportunities

- **Phase 3 (US1)**: T003, T004, T005 fully parallel → T006 after all three
- **Phase 4 (US2)**: T007, T008 parallel → T009 after both → T010 after T009
- **Phase 5 (US3)**: T011, T012 parallel → T013 after both → T014 after T013
- **Phase 6 (US4)**: T015, T016, T017 fully parallel → T018 after all three → T019 after T018
- **Phase 7 (US5)**: T020 → T021 sequential (T021 integrates T020)
- **Phase 8**: T022 and T023 fully parallel → T024 after both

---

## Parallel Example: User Story 4

```bash
# After Phase 2 + US3 complete, launch all US4 foundation tasks together:
Task T015: Create src/hooks/useBlobUrl.js
Task T016: Create src/hooks/useDeleteAttachment.js
Task T017: Create src/components/notes/AttachmentItem.jsx

# Then, once T015–T017 complete:
Task T018: Create src/components/notes/AttachmentGallery.jsx
# Then, once T018 complete:
Task T019: Update src/pages/NoteDetailPage.jsx — integrate AttachmentGallery
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (API layer — **CRITICAL**)
2. Complete Phase 3: User Story 1 (live notes list + FAB)
3. **STOP and VALIDATE**: Open a notebook → confirm live notes list renders → empty state shows for empty notebooks → FAB is visible
4. Demo or deploy MVP

### Incremental Delivery

1. Phase 2 → API foundation ready
2. Phase 3 (US1) → Live notes list — test and demo
3. Phase 4 (US2) → Create note — test full creation flow
4. Phase 5 (US3) → Auto-save title — test debounce and saving indicator
5. Phase 6 (US4) → Attachments — test gallery, upload, download, optimistic delete
6. Phase 7 (US5) → Delete note — test countdown confirmation
7. Phase 8 → Polish and full quickstart.md validation

---

## Notes

- `[P]` tasks = different files, no dependencies on each other — safe to implement in parallel
- No test tasks — Principle IX: no unit tests (confirmed in plan.md and spec.md)
- F7 route order is critical: `/notes/create` MUST be registered before `/notes/:noteId` in `App.jsx` — see research.md "Decision: Route Order in App.jsx"
- Files requiring auth MUST use `client.js` helpers (`getBlob` / `postForm`), never direct `<img src>` or bare `fetch` without the `Authorization` header
- Auto-save debounce: 800ms satisfies SC-003 (≤ 1s after pause)
- Note delete: non-optimistic with 5-second countdown (matches notebook delete pattern — complexity tracked in plan.md)
- Attachment delete: optimistic with simple confirm/cancel — NO countdown (per spec.md Assumptions)
- Attachment upload: non-optimistic — `fileSrcId` is only known after server response; no client-side placeholder value exists
- `useUploadAttachment` (T008) is created in US2 and reused without changes in US4's `AttachmentGallery`
- TanStack Query key `['file', fileSrcId]` uses `staleTime: Infinity` — file content is immutable; never invalidated by note/notebook mutations
