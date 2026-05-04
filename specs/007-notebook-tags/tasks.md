# Tasks: Notebook Tags Management

**Input**: Design documents from `/specs/007-notebook-tags/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Not requested (Constitution IX — no unit tests).

**Organization**: Tasks grouped by user story for independent implementation and delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task serves (US1–US4 per spec.md)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Shared display component used by US1 (tag list within popup) and US4 (detail screen). Must exist before either story can be completed.

**⚠️ CRITICAL**: Complete before starting US1 or US4.

- [x] T001 Create `src/components/notebooks/TagChip.jsx` — custom pill component: renders F7 icon identifier + title side-by-side, accepts `tag: { id, title, icon }` prop, applies theme-colored background with `border-radius: 20px`

**Checkpoint**: `TagChip` renders icon and title correctly when dropped into any screen.

---

## Phase 2: User Story 1 — Create Notebook with Tags (Priority: P1) 🎯 MVP

**Goal**: User can configure an arbitrary set of tags (each with a title and icon) before submitting the Create Notebook form. Tags are held in local state inside the popup and sent as a full array with the creation payload.

**Independent Test**: Create a notebook with two tags; verify the saved notebook returns those two tags from the API.

- [x] T00X [P] [US1] Create `src/components/notebooks/TagsPopup.jsx` — Framework7 Sheet; accepts props `mode='create'|'edit'`, `notebookId`, `tags`, `onTagsChange`, `opened`, `onClose`; renders tag list (each row: TagChip + edit + delete buttons); inline add/edit form at bottom (title ListInput + IconSelector for icon); "Agregar etiqueta" button toggles inline form; confirm button validates non-empty title and selected icon; in create mode all mutations update local `tags` state and call `onTagsChange` immediately; no API calls in create mode
- [x] T00X [P] [US1] Update `src/hooks/useCreateNotebook.js` — add `tags: payload.tags ?? []` to the optimistic notebook object inside `onMutate` so the list reflects tags instantly before the server responds
- [x] T00X [US1] Update `src/pages/CreateNotebookPage.jsx` — add `const [tags, setTags] = useState([])` and `const [tagsPopupOpen, setTagsPopupOpen] = useState(false)`; add "Gestionar etiquetas" Button below the Members section; render `<TagsPopup mode="create" tags={tags} onTagsChange={setTags} opened={tagsPopupOpen} onClose={...} />`; include `tags` in the `mutate(...)` payload passed to `useCreateNotebook`

**Checkpoint**: Create a notebook with two tags — notebook list card appears immediately (optimistic), reload confirms tags persisted.

---

## Phase 3: User Story 2 — Edit Notebook Tags (Priority: P2)

**Goal**: From the Edit Notebook sheet, the user taps "Gestionar etiquetas" to open the Tags Popup pre-populated with existing tags. Each add/edit/delete confirms immediately via dedicated tag endpoints, with optimistic UI and rollback on failure.

**Independent Test**: Open a notebook with two existing tags; remove one, add a new one; verify the notebook detail reflects the change without a manual reload.

- [x] T00X [P] [US2] Create `src/api/tags.js` — export three functions using the existing `post`, `patch`, `del` helpers from `src/api/client.js`: `addTag(notebookId, { title, icon })` → POST `/api/v1/notebooks/:id/tags`; `updateTag(notebookId, tagId, payload)` → PATCH `/api/v1/notebooks/:id/tags/:tagId`; `deleteTag(notebookId, tagId)` → DELETE `/api/v1/notebooks/:id/tags/:tagId`
- [x] T00X [P] [US2] Create `src/hooks/useAddTag.js` — `useMutation` wrapping `addTag`; `onMutate`: cancel `['notebook', notebookId]`, snapshot previous, append `{ id: 'temp-${Date.now()}', title, icon }` to `notebook.data.tags`; `onError`: restore previous snapshot; `onSettled`: `invalidateQueries(['notebook', notebookId])` + `invalidateQueries(['notebooks'], { refetchType: 'none' })`
- [x] T00X [P] [US2] Create `src/hooks/useUpdateTag.js` — same optimistic pattern as `useAddTag`; `onMutate` replaces the matching tag (by id) in `notebook.data.tags` with the new title/icon; rollback and invalidation identical to `useAddTag`
- [x] T00X [P] [US2] Create `src/hooks/useDeleteTag.js` — same optimistic pattern; `onMutate` filters out the matching tag by id from `notebook.data.tags`; rollback and invalidation identical to `useAddTag`
- [x] T00X [US2] Extend `src/components/notebooks/TagsPopup.jsx` to support edit mode — when `mode='edit'`, the confirm action on the inline add form calls `useAddTag(notebookId).mutate(...)` instead of updating local state; the edit confirm action calls `useUpdateTag`; the delete action calls `useDeleteTag`; show inline loading indicator on the specific tag row while its mutation is pending; show a toast (`f7.toast.create`) on mutation error so the user knows the action failed
- [x] T01X [US2] Update `src/components/notebooks/EditNotebookSheet.jsx` — add `const [tagsPopupOpen, setTagsPopupOpen] = useState(false)`; add "Gestionar etiquetas" Button inside the sheet body (below Members, above the Save button); render `<TagsPopup mode="edit" notebookId={notebook.id} tags={notebook?.tags ?? []} onTagsChange={() => {}} opened={tagsPopupOpen} onClose={...} />`

**Checkpoint**: Edit notebook tags — each action (add/edit/delete) reflects immediately in the popup and on the detail screen; refreshing confirms the change persisted.

---

## Phase 4: User Story 3 — Tag Icon Selection (Priority: P3)

**Goal**: The icon picker (IconSelector) is correctly embedded in the inline tag form inside TagsPopup, opens without z-index or swipe conflicts, and validates that an icon must be selected before confirming a tag.

**Independent Test**: Add a tag, tap the icon field, pick a specific icon, confirm — the tag appears in the list with the correct icon; attempting to confirm without an icon shows an inline error.

- [x] T01X [US3] In `src/components/notebooks/TagsPopup.jsx`, verify the inline tag form renders `<IconSelector value={formIcon} onChange={setFormIcon} />` as a `ListItem` within a `List`; add icon validation: if `formIcon` is falsy on confirm, show inline error text "Selecciona un ícono"; confirm that the `IconSelector` Sheet opens correctly from within the `TagsPopup` Sheet (test on device/simulator — no z-index fix should be needed as `IconSelector` already renders at root level)

**Checkpoint**: Full tag add/edit cycle with icon picker works without visual glitches on mobile viewport.

---

## Phase 5: User Story 4 — View Tags on Notebook Detail (Priority: P3)

**Goal**: When a notebook has tags, the detail screen shows them as a horizontal row of `TagChip` pills below the header.

**Independent Test**: Open a notebook with two tags — both chips appear with correct icon and title; open one with no tags — no chip row is visible.

- [x] T01X [US4] Update `src/pages/NotebookDetailPage.jsx` — inside the stable `<div>` wrapper added in the previous DOM fix, after the Navbar and before the notes list, render a horizontally scrollable chip row when `notebook?.tags?.length > 0`: `<div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '8px 16px' }}>` containing `notebook.tags.map(tag => <TagChip key={tag.id} tag={tag} />)`

**Checkpoint**: Detail screen shows tag chips; adding a tag in the edit flow updates the chips without a reload.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency pass across all new components.

- [x] T01X [P] Review all user-facing strings in `src/components/notebooks/TagsPopup.jsx` — confirm labels, button text, validation messages, and toast error text are in Spanish, matching the conventions of existing components (e.g., "Agregar etiqueta", "Guardar", "El título de la etiqueta es obligatorio", "Selecciona un ícono", "Error al guardar la etiqueta. Intenta de nuevo.")
- [x] T01X [P] Update `src/hooks/useCreateNotebook.js` optimistic object and `src/hooks/useUpdateNotebook.js` to ensure the `tags` field is preserved during their own optimistic updates — verify that tag chips do not disappear from the detail screen when an unrelated notebook field (title, color, etc.) is being saved

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (TagChip). T002 and T003 are parallel; T004 depends on T002
- **US2 (Phase 3)**: Depends on Phase 2 (TagsPopup must exist). T005–T008 are fully parallel; T009 depends on T005–T008; T010 depends on T009
- **US3 (Phase 4)**: Depends on Phase 2 (refinement of TagsPopup)
- **US4 (Phase 5)**: Depends on Phase 1 (TagChip)
- **Polish (Phase 6)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 1 — no dependency on US2/US3/US4
- **US2 (P2)**: Depends on US1 (TagsPopup must exist in create mode before edit mode is added)
- **US3 (P3)**: Depends on US1 (refinement of TagsPopup)
- **US4 (P3)**: Depends on Phase 1 only — can be done in parallel with US1

### Parallel Opportunities Within US2

T005, T006, T007, T008 touch different files and have no mutual dependencies — all four can be executed simultaneously:

```
T005  src/api/tags.js
T006  src/hooks/useAddTag.js
T007  src/hooks/useUpdateTag.js
T008  src/hooks/useDeleteTag.js
```

---

## Implementation Strategy

### MVP First (US1 only)

1. T001 — TagChip
2. T002, T003 (parallel) — TagsPopup + useCreateNotebook update
3. T004 — CreateNotebookPage integration
4. **STOP and VALIDATE**: Create a notebook with tags and confirm they persist

### Incremental Delivery

1. Phase 1 + Phase 2 → Tags on creation (MVP)
2. Phase 3 → Tags editable from Edit sheet (full edit flow)
3. Phase 4 → Icon picker validation (UX polish)
4. Phase 5 → Tags visible on detail screen (display layer)
5. Phase 6 → Consistency pass

---

## Notes

- [P] tasks touch different files — safe to run in parallel
- US2 (edit mode) extends the same `TagsPopup.jsx` built in US1 — do NOT start US2 until T002 is complete
- Backend tag endpoints (`POST/PATCH/DELETE /notebooks/:id/tags/:tagId`) and `tags` field in `NotebookResponseDto` must be deployed before T009/T010 can be validated end-to-end. Frontend code can be written ahead of time; use mock data for local testing.
- TagChip (T001) is the only task US4 strictly needs — it can be done in parallel with any US1 task
