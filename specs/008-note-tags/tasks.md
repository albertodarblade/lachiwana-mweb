# Tasks: Note Tags

**Input**: Design documents from `/specs/008-note-tags/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/ ✅ quickstart.md ✅

**Tests**: Not requested (Constitution IX — no unit tests).

**Organization**: Tasks grouped by user story for independent implementation and delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: User story this task serves (US1–US3 per spec.md)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Shared component and hook extension needed by all user stories.

**⚠️ CRITICAL**: Complete before starting any user story.

- [x] T00X Create `src/components/notes/NoteTagPicker.jsx` — Framework7 Sheet (`swipeToClose`, `backdrop`, `height: 'auto'`, drag handle); accepts props `notebookTags: Tag[]`, `selectedTagIds: string[]`, `onConfirm(ids: string[])`, `opened`, `onClose`; renders each notebook tag as an F7 `ListItem` with `checkbox`, showing `TagChip` for the label; a "Listo" Button at the bottom calls `onConfirm` with the current selection and then `onClose`; tapping a tag row toggles its ID in local selection state; if `notebookTags` is empty shows a `<Block>` with "Este cuaderno no tiene etiquetas."
- [x] T00X Update `src/hooks/useUpdateNote.js` — extend `mutationFn` to accept optional `tags: string[]` alongside `title`; pass only defined fields to `updateNote`; update the optimistic `setQueryData` call to spread `tags` into the cached note object when `tags` is provided; rollback and invalidation are unchanged

**Checkpoint**: `NoteTagPicker` renders correctly and `useUpdateNote` accepts `{ tags }`.

---

## Phase 2: User Story 1 — Tag a Note During Creation (Priority: P1) 🎯 MVP

**Goal**: The note creation form has a "Gestionar etiquetas" button. The user picks tags from the notebook's tag list. Selected tags are sent with the note creation payload.

**Independent Test**: Create a note with two tags selected; verify the saved note returns those two tag IDs.

- [x] T00X [P] [US1] Update `src/components/notes/CreateNotePopup.jsx` — import `NoteTagPicker` and `useNotebook`; add `const [selectedTagIds, setSelectedTagIds] = useState([])` and `const [tagPickerOpen, setTagPickerOpen] = useState(false)`; fetch `notebookTags` from `useNotebook(notebookId)?.data?.tags ?? []`; add a "Gestionar etiquetas" `Button` (outline) above the submit button showing selected count when >0; render `<NoteTagPicker notebookTags={notebookTags} selectedTagIds={selectedTagIds} onConfirm={setSelectedTagIds} opened={tagPickerOpen} onClose={...} />`; add `tags: selectedTagIds` to the `createNote` payload; reset `selectedTagIds` to `[]` in the `reset()` function

**Checkpoint**: Create a note with two tags — note is saved with those tag IDs, selection resets after creation.

---

## Phase 3: User Story 2 — Manage Tags on an Existing Note (Priority: P2)

**Goal**: The note detail screen has a "Gestionar etiquetas" button. Opening it shows the notebook's tags with the note's current tags pre-selected. Closing the picker after changes immediately saves the new tag selection.

**Independent Test**: Open a note with one tag, remove it and add another, close picker — verify the note's tags updated without a manual reload.

- [x] T00X [US2] Update `src/pages/NoteDetailPage.jsx` — import `NoteTagPicker`, `TagChip`, `useNotebook`; add `const [tagPickerOpen, setTagPickerOpen] = useState(false)`; fetch `notebookTags` from `useNotebook(notebookId)?.data?.tags ?? []` and `currentTagIds` from `note?.tags ?? []`; add a tags section below the title input: a horizontal chip row (`display: flex, gap: 8, overflowX: auto, padding: '4px 16px'`) showing `<TagChip>` for each resolved tag, followed by a "Gestionar etiquetas" `Button` (outline, small); on `NoteTagPicker` `onConfirm`, call `mutate({ tags: newIds })` from `useUpdateNote` then close the picker; render `<NoteTagPicker notebookTags={notebookTags} selectedTagIds={currentTagIds} onConfirm={handleTagsConfirm} opened={tagPickerOpen} onClose={...} />`

**Checkpoint**: Open note with one tag, add a second, close picker — chips update immediately; reload confirms persistence.

---

## Phase 4: User Story 3 — View Tags on Notes List and Detail (Priority: P2)

**Goal**: Note cards in the notes list show assigned tag chips. Tag chips are also visible on the note detail screen (already partially addressed in T004).

**Independent Test**: Assign two tags to a note, go back to the notes list — both chips appear on the note card without any extra interaction.

- [x] T00X [US3] Update `src/components/notes/NoteCard.jsx` — import `TagChip` and `queryClient` from `../../queryClient`; resolve tags inside the component: `const notebook = queryClient.getQueryData(['notebook', notebookId])`, `const notebookTags = notebook?.data?.tags ?? []`, `const resolvedTags = (note.tags ?? []).map(id => notebookTags.find(t => t.id === id)).filter(Boolean)`; if `resolvedTags.length > 0`, render a horizontal chip row (`display: flex, gap: 6, overflowX: auto, padding: '0 12px 8px', flexWrap: wrap`) inside the card below the title row, showing `<TagChip key={tag.id} tag={tag} />` for each resolved tag

**Checkpoint**: Notes list shows tag chips on cards with tags; cards without tags show no chip row.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final consistency pass.

- [x] T00X [P] Verify that when `useUpdateNote` saves `{ tags }`, the optimistic update in `src/hooks/useUpdateNote.js` spreads the new tags into the cached note's `['notes', notebookId]` list entries as well — ensuring the NoteCard chips update without waiting for the list refetch
- [x] T00X [P] In `src/components/notes/CreateNotePopup.jsx`, verify the `NoteTagPicker` does not render when `notebookTags` is empty (the picker still opens but shows the empty state message from T001); confirm the "Gestionar etiquetas" button is hidden when the notebook has no tags defined

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — start immediately
- **US1 (Phase 2)**: Depends on Phase 1 (NoteTagPicker + useUpdateNote)
- **US2 (Phase 3)**: Depends on Phase 1 (NoteTagPicker + useUpdateNote extended)
- **US3 (Phase 4)**: Depends on Phase 1 (TagChip already exists); independent of US1/US2
- **Polish (Phase 5)**: Depends on all story phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 1 only
- **US2 (P2)**: Depends on Phase 1 only; independent of US1
- **US3 (P2)**: Depends on Phase 1 only; can be done in parallel with US1/US2

### Parallel Opportunities

T003 and the US3 task T005 touch different files and can run in parallel after Phase 1:

```
After T001 + T002:
  T003  src/components/notes/CreateNotePopup.jsx  (US1)
  T005  src/components/notes/NoteCard.jsx          (US3)
```

T004 (NoteDetailPage) can start after T001 + T002 as well but is sequential to T003 for review continuity.

---

## Implementation Strategy

### MVP First (US1 only)

1. T001 + T002 — foundational
2. T003 — CreateNotePopup integration
3. **STOP and VALIDATE**: Create a note with tags and confirm they persist

### Incremental Delivery

1. Phase 1 → shared component + hook
2. US1 (T003) → tags on note creation
3. US2 (T004) → edit tags from detail screen
4. US3 (T005) → chips visible on list cards
5. Phase 5 → polish

---

## Notes

- [P] tasks touch different files — safe to run in parallel
- `NoteTagPicker` (T001) is the only foundational blocker — everything else depends on it
- Backend already supports `tags: string[]` on all note endpoints — no API changes needed
- Tag resolution from cache (T005) is synchronous and zero-cost — no extra queries
- The "Gestionar etiquetas" button in T007 should be hidden (not just disabled) when the notebook has no tags, to avoid confusing users
