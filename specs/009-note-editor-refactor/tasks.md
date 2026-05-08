# Tasks: Note Editor Refactor

**Input**: Design documents from `specs/009-note-editor-refactor/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: No test tasks generated (not requested; Constitution IX — velocity over ceremony).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)

---

## Phase 1: Setup (MDXEditor Integration)

**Purpose**: Install and configure the new dependency before any component work begins. T001 is a gate — if React 19 compatibility fails, the approach must be revisited before proceeding.

- [x] T001 Install `@mdxeditor/editor` via pnpm and verify React 19.2.5 compatibility: run `pnpm dev`, open any note, confirm no console errors related to `useContext` or React internals (ref: research.md Decision 1 risk)
- [x] T002 Import `@mdxeditor/editor/style.css` in `src/main.jsx` (add after existing CSS imports)
- [x] T003 Create `src/styles/note-editor.css` with fixed-bottom toolbar override: `.note-editor-bottom-toolbar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 500; border-top: 1px solid var(--f7-list-item-border-color); border-bottom: none; background: var(--f7-page-bg-color); }` and import it in `src/main.jsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared components and NoteCard update that MUST be complete before either editor page can be built. NoteEditor is used by both US1 and US2; NoteCard must handle markdown titles before any note is created via the new flow.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T004 Create `src/components/notes/NoteEditor.jsx` — MDXEditor wrapper that accepts `{ initialContent, onContentChange, imageUploadHandler, className }` props; registers `listsPlugin()`, `imagePlugin({ imageUploadHandler })`, and `toolbarPlugin({ toolbarClassName: 'note-editor-bottom-toolbar', toolbarContents: () => (<><UndoRedo /><BoldItalicUnderlineToggles /><CodeToggle /><ListsToggle options={['bullet','number','check']} /><InsertImage /></>) })`; sets `contentEditableClassName` for proper viewport height fill
- [x] T005 [P] Create `src/components/notes/NoteEditorHeader.jsx` — accepts `{ notebookId, selectedTagIds, onTagsConfirm, createdAt }` props; renders tag chips row (existing `TagChip`) + "Agregar / Gestionar etiquetas" button that opens `NoteTagPicker`; displays formatted `createdAt` date below tags (e.g. "Creado: 4 may 2026"); uses Framework7 `Block` for layout
- [x] T006 [P] Update `src/components/notes/NoteCard.jsx` — replace `{note.title}` display with a derived display title: take first non-empty line of `note.title`, strip leading `#+\s*` markdown heading markers, trim, fall back to `'(sin título)'` if empty

**Checkpoint**: `NoteEditor`, `NoteEditorHeader` components exist and `NoteCard` renders markdown-aware titles — ready to build editor pages.

---

## Phase 3: User Story 1 — Create Note with Rich Text (Priority: P1) 🎯 MVP

**Goal**: Users can tap the create note action and land on a full-screen editor page with tag selector at top, MDXEditor body, and toolbar at bottom. Note is eagerly created on mount; content is auto-saved on debounce.

**Independent Test**: Navigate to any notebook → tap FAB → confirm new full-screen page opens (not a sheet) → type content, apply bold/italic/checklist → tap back → verify note appears in list with correct first-line title.

- [x] T007 [US1] Create `src/pages/CreateNoteEditorPage.jsx` — on mount: call `useCreateNote(notebookId).mutateAsync({ title: '', tags: [] })` and store returned `noteId` in state; render `<Page>` with `<Navbar backLink="Atrás" title="Nota nueva" />`, `<NoteEditorHeader>` below navbar, `<NoteEditor initialContent="" onContentChange={handleContentChange} imageUploadHandler={handleImageUpload} />` filling remaining height; `handleContentChange` starts 800ms debounce then calls `useUpdateNote(notebookId, noteId).mutate({ title: content })`; `handleImageUpload` calls `prepareFileForUpload` then `uploadAttachment` and returns remote URL; show "Guardando…" indicator during in-flight saves
- [x] T008 [US1] Add `ProtectedCreateNoteEditor` wrapper component and route `{ path: '/notebooks/:notebookId/notes/create', component: ProtectedCreateNoteEditor }` in `src/App.jsx`; ensure the new route is listed **before** `/notebooks/:id` to avoid path conflicts in Framework7's router
- [x] T009 [US1] Update `src/pages/NotebookDetailPage.jsx` — replace `<CreateNotePopup>` sheet usage with `navigate('/notebooks/${notebookId}/notes/create')`; remove `popupOpened` state, `CreateNotePopup` import, and the FAB's `onClick` handler that opened the sheet
- [x] T010 [US1] Delete `src/components/notes/CreateNotePopup.jsx` (confirm no other imports remain via search before deleting)

**Checkpoint**: Create note flow fully works end-to-end: FAB → full-screen editor → type → auto-save → back → note in list. CreateNotePopup no longer exists.

---

## Phase 4: User Story 2 — Edit Note with Rich Text (Priority: P1)

**Goal**: Tapping an existing note opens a full-screen editor page (same route as before) showing the note's current `title` field as markdown content, with the same layout as create. Changes auto-save on debounce. Delete action is accessible via the actions menu.

**Independent Test**: Tap any existing note → confirm full-screen editor opens (not old NoteDetailPage) → note content loads in editor → edit text, apply formatting → back → note in list updated → re-open → confirm edits persisted.

- [x] T011 [US2] Create `src/pages/NoteEditorPage.jsx` — load note via `useNote(notebookId, noteId)`; initialise MDXEditor with `note.title` (once, guarded with `initializedRef`); render same layout as `CreateNoteEditorPage` (Navbar with `⋯` actions button, `NoteEditorHeader`, `NoteEditor`); 800ms debounced `useUpdateNote` for content changes; immediate `useUpdateNote` for tag changes; F7 `Actions` sheet with "Eliminar nota" → existing delete countdown sheet (port from `NoteDetailPage.jsx`); show "Guardando…" indicator
- [x] T012 [US2] Update `src/App.jsx` — replace `NoteDetailPage` import and `ProtectedNoteDetail` wrapper with `NoteEditorPage` and `ProtectedNoteEditor` for route `/notebooks/:notebookId/notes/:noteId`
- [x] T013 [US2] Delete `src/pages/NoteDetailPage.jsx` (confirm no remaining imports before deleting)

**Checkpoint**: All existing notes open in the new editor. Edit, tag management, and delete all work. NoteDetailPage no longer exists.

---

## Phase 5: User Story 3 — Navigation (Priority: P2)

**Goal**: Back navigation from both editor pages is seamless: any pending auto-save fires before leaving; empty notes created on the create page are cleaned up.

**Independent Test**: On create page — type nothing, tap back → confirm no empty note appears in list. On create page — type content, immediately tap back → confirm note is saved with content. On edit page — edit content, immediately tap back before debounce fires → confirm edit is saved.

- [x] T014 [US3] In `src/pages/CreateNoteEditorPage.jsx` — add Framework7 `page:beforeout` event listener (via `useEffect` on the `Page` ref or `onPageBeforeOut` prop): flush the pending debounce immediately (call `updateNote` synchronously if content is non-empty and timer is pending); if `noteId` exists and content is empty (user never typed), call `useDeleteNote(notebookId, noteId).mutate()` before navigation completes
- [x] T015 [US3] In `src/pages/NoteEditorPage.jsx` — add `page:beforeout` event handler: flush pending debounce immediately so in-progress edits are saved before the page transitions out

**Checkpoint**: All three user stories fully functional. Navigation is safe with no data loss and no orphaned empty notes.

---

## Phase N: Polish & Cross-Cutting Concerns

- [x] T016 [P] Fine-tune `src/styles/note-editor.css` — set explicit `padding-bottom` on the editor page content equal to toolbar height (~56px) so content is not hidden behind fixed toolbar; test on iOS Safari and Android Chrome (keyboard raise behaviour)
- [ ] T017 End-to-end smoke test per `specs/009-note-editor-refactor/quickstart.md` — manually verify: (1) create note with all 9 toolbar actions applied, image inserted, tags assigned; (2) list shows first line as title; (3) edit existing note; (4) delete note; (5) back navigation saves correctly on both pages

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately. T001 is a hard gate.
- **Foundational (Phase 2)**: Depends on Phase 1 completion. Blocks US1 and US2.
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion.
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion. Can run in parallel with US1 if staffed.
- **User Story 3 (Phase 5)**: Depends on Phase 3 and Phase 4 completion (edits both pages).
- **Polish (Phase N)**: Depends on all story phases.

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2 — no dependency on US2.
- **US2 (P1)**: Unblocked after Phase 2 — no dependency on US1 (shares `NoteEditor` + `NoteEditorHeader` from Phase 2).
- **US3 (P2)**: Must follow both US1 and US2 (modifies their page components).

### Within Each Phase

- T005 and T006 are [P] and can run in parallel with T004 (different files).
- T008 and T009 are independent within Phase 3 (different files) but both require T007 first.
- T012 and T013 are sequential after T011.

### Parallel Opportunities

```bash
# Phase 2 — run together:
T005  NoteEditorHeader.jsx
T006  NoteCard.jsx

# Phase 3 — after T007:
T008  App.jsx route
T009  NotebookDetailPage.jsx

# Phase 4 — after T011:
T012  App.jsx route   (but T012 + T008 touch same file — must be sequential overall)
```

> ⚠️ T008 (US1) and T012 (US2) both modify `src/App.jsx` — do not run these in parallel; sequence them.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T003)
2. Complete Phase 2: Foundational (T004–T006)
3. Complete Phase 3: User Story 1 (T007–T010)
4. **STOP and VALIDATE**: create note end-to-end, verify in list
5. Ship or demo — US1 alone is a complete, usable increment

### Incremental Delivery

1. Setup + Foundational → shared infrastructure ready
2. User Story 1 → create flow works → demo/validate
3. User Story 2 → edit flow works → demo/validate (NoteDetailPage retired)
4. User Story 3 → safe navigation → polish
5. Each phase adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no blocking incomplete dependencies
- [Story] label maps task to specific user story for traceability
- T001 is a hard gate — if MDXEditor has React 19 issues, resolve before any component work
- T008 and T012 both touch `src/App.jsx` — must be done sequentially (T008 first, T012 second)
- Verify no remaining imports of `CreateNotePopup` and `NoteDetailPage` before deleting them (T010, T013)
- Commit after each checkpoint (end of each phase)
