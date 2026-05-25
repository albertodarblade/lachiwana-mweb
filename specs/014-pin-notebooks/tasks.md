# Tasks: Pin Notebooks

**Input**: Design documents from `specs/014-pin-notebooks/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no blocking dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- Include exact file paths in all descriptions

---

## Phase 1: Setup

No setup required — no new packages, no project initialization needed. Proceed directly to Phase 2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pin storage layer — MUST be complete before any user story UI work begins

**⚠️ CRITICAL**: No user story implementation can begin until T001 and T002 are complete.

- [x] T001 Create `src/stores/pinStore.js`. Export three functions following the `settingsStore.js` try/catch pattern. localStorage key: `` `lachiwana_pins_${userId}` ``. Data: JSON array of `{ notebookId: string, pinnedDate: string }`. `getPins(userId)`: reads and parses key; returns `[]` on missing or corrupt data. `pinNotebook(userId, notebookId)`: reads current pins, removes any existing entry for notebookId (upsert), appends `{ notebookId, pinnedDate: new Date().toISOString() }`, writes back. `unpinNotebook(userId, notebookId)`: reads current pins, filters out notebookId, writes back. Wrap all localStorage access in try/catch; swallow errors silently.

- [x] T002 [P] Create `src/hooks/usePinnedNotebooks.js`. Accept `userId` parameter. Seed `useState` with `getPins(userId)` from pinStore. Return `{ pins, pinNotebook(notebookId), unpinNotebook(notebookId), isPinned(notebookId) }`. `pinNotebook` and `unpinNotebook` call the store functions then call `setPins(getPins(userId))` to sync state. `isPinned` derives from `pins.some(p => p.notebookId === notebookId)`.

**Checkpoint**: Foundation ready — pinStore can be called from the browser console to verify read/write behavior before UI work begins.

---

## Phase 3: User Story 1 — Pin a Notebook (Priority: P1) 🎯 MVP

**Goal**: A user can tap a pin button on any notebook card; the card immediately moves to a "Pinned" section at the top of the list and stays there after a page reload.

**Independent Test**: Pin one notebook → verify it appears under "Pinned" label at the top → reload page → verify it is still pinned.

- [x] T003 [US1] Modify `src/components/notebooks/NotebookCard.jsx`. Add `isPinned` (bool, default `false`) and `onPinToggle` (function) props. Import `Pin` from `lucide-react`. Inside the card, add a `<button>` element with `data-testid="notebook-card-pin-{notebook.id}"` that calls `onPinToggle(notebook.id)` on click and stops event propagation (`e.stopPropagation()`) so the card's `<Link>` navigation is not triggered. Apply `styles.pinButton` class; add `styles.active` class when `isPinned` is true.

- [x] T004 [P] [US1] Add `.pinButton` styles to `src/components/notebooks/NotebookCard.module.css`. Position the button absolutely in the top-right corner of the card. When `.active`: icon at full opacity with the card's accent color. When not `.active`: icon at reduced opacity (muted). No `style={{}}` for static values.

- [x] T005 [US1] Modify `src/pages/NotebooksPage.jsx`. Import `usePinnedNotebooks` from `../hooks/usePinnedNotebooks` and `getSession` from `../stores/authStore`. Derive `userId = getSession()?.user?.googleId ?? ''`. Call `usePinnedNotebooks(userId)`. After the existing `updatedAt` sort, build `pinnedMap = Object.fromEntries(pins.map(p => [p.notebookId, p.pinnedDate]))` for efficient lookup. Split into `pinnedNotebooks = notebooks.filter(n => pinnedMap[n.id]).sort((a, b) => new Date(pinnedMap[b.id]) - new Date(pinnedMap[a.id]))` and `unpinnedNotebooks = notebooks.filter(n => !pinnedMap[n.id])`. Define `handlePinToggle(notebookId)` that calls `isPinned(notebookId) ? unpinNotebook(notebookId) : pinNotebook(notebookId)`. Render: when `pinnedNotebooks.length > 0`, show `<div className={styles.sectionLabel} data-testid="notebooks-section-pinned">Pinned</div>` above pinned cards; then `<div className={styles.sectionLabel} data-testid="notebooks-section-all">All</div>` above unpinned cards. When `pinnedNotebooks.length === 0`, render notebooks as a single flat list with no labels. Pass `isPinned={isPinned(notebook.id)}` and `onPinToggle={handlePinToggle}` to every `NotebookCard`.

- [x] T006 [P] [US1] Add `.sectionLabel` styles to `src/pages/NotebooksPage.module.css`. Small, uppercase, muted text label with appropriate top margin and bottom padding to visually separate sections from the card grid. No `style={{}}` for static values.

**Checkpoint**: US1 fully functional — pin one notebook, verify it moves to top under "Pinned" label, verify persistence on reload.

---

## Phase 4: User Story 2 — Multiple Pins Ordered by pinnedDate (Priority: P2)

**Goal**: When multiple notebooks are pinned, the most recently pinned appears first. Re-pinning an already-pinned notebook moves it to the top.

**Independent Test**: Pin Notebook A, then pin Notebook B → verify B appears above A. Unpin B then re-pin B → verify B appears at top again.

- [x] T007 [US2] Validate upsert behavior in `src/stores/pinStore.js` — confirm `pinNotebook` removes any existing entry for `notebookId` before appending the new one. If not already in place from T001, update the function now. The upsert ensures re-pinning a notebook gives it the most recent `pinnedDate`, moving it to the top of the sorted pinned section.

- [x] T008 [US2] Validate pinnedDate sort in `src/pages/NotebooksPage.jsx` — confirm the sort comparison `new Date(pinnedMap[b.id]) - new Date(pinnedMap[a.id])` is correctly placed and handles multiple pinned notebooks. Mental walkthrough: pin A at T1, pin B at T2 (T2 > T1) → B must appear first. If sort is already correct from T005, mark as done.

**Checkpoint**: Pin three notebooks in sequence → they appear in reverse pin order (most recently pinned first).

---

## Phase 5: User Story 4 — Per-User Pin State (Priority: P2)

**Goal**: Each logged-in user has an independent set of pinned notebooks stored under their own `googleId`.

**Independent Test**: Pin a notebook as User A → log out → log in as User B → confirm no notebooks are pinned → log back in as User A → confirm the pin is still there.

- [x] T009 [US4] Confirm per-user keying across `src/pages/NotebooksPage.jsx` and `src/stores/pinStore.js`. In the page, `userId` must be derived as `getSession()?.user?.googleId ?? ''` and passed to `usePinnedNotebooks(userId)`. In the store, the localStorage key must be `` `lachiwana_pins_${userId}` ``. Verify in browser DevTools → Application → Local Storage that the key contains the actual `googleId` value and that two different user IDs produce two distinct keys.

**Checkpoint**: Two different user sessions produce distinct localStorage keys (`lachiwana_pins_user1` vs `lachiwana_pins_user2`) with independent pin lists.

---

## Phase 6: User Story 3 — Unpin a Notebook (Priority: P3)

**Goal**: A user can unpin a notebook; it moves back to the "All" section immediately. When the last pin is removed, all section labels disappear.

**Independent Test**: Pin a notebook → verify "Pinned" label appears → unpin it → verify the card moves to the flat list and both "Pinned" and "All" labels disappear.

- [x] T010 [US3] Confirm toggle logic in `src/pages/NotebooksPage.jsx` — `handlePinToggle(notebookId)` calls `unpinNotebook(notebookId)` when `isPinned(notebookId)` is true, and `pinNotebook(notebookId)` when false. Should be in place from T005; if not, add it now.

- [x] T011 [US3] Confirm conditional section label rendering in `src/pages/NotebooksPage.jsx` — when `pinnedNotebooks.length === 0`, neither the "Pinned" label nor the "All" label renders and the list is a single flat section. Should be in place from T005; if not, add it now.

**Checkpoint**: (1) Pin shows "Pinned" label → (2) Unpin removes card from pinned section → (3) Last unpin removes both labels.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge case verification and acceptance validation

- [x] T012 [P] Verify deleted notebook pin handling in `src/pages/NotebooksPage.jsx` — `pinnedNotebooks` is built by filtering the live `notebooks` array from the API (`notebooks.filter(n => pinnedMap[n.id])`). Since deleted notebooks are absent from the API response, their pin entries in `pinnedMap` are automatically ignored. Confirm this assumption: no stale pin entry causes a crash or renders a ghost card.

- [x] T013 [P] Verify corrupt localStorage handling in `src/stores/pinStore.js` — manually set `lachiwana_pins_{userId}` to `"not-json"` in DevTools → Application → Local Storage, then reload the app. Confirm the notebooks list renders normally with all notebooks unpinned and no console errors. The try/catch in `getPins` must absorb the `JSON.parse` error.

- [ ] T014 Run the quickstart acceptance checklist in `specs/014-pin-notebooks/quickstart.md` — start the dev server with `pnpm dev`, navigate to the notebooks list, and manually verify every checklist item: pin button visible on every card, immediate reorder on pin, "Pinned"/"All" section labels, correct multi-pin order, persistence on reload, pin state retained after logout/login, two-user localStorage isolation, and no crash when a pinned notebook is deleted.

**Checkpoint**: All quickstart checklist items pass. Feature is complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: No dependencies — start immediately
- **US1 (Phase 3)**: Requires Phase 2 complete (T001, T002)
- **US2 (Phase 4)**: Requires Phase 3 complete (sort logic lives in NotebooksPage from T005)
- **US4 (Phase 5)**: Requires Phase 2 complete — can run in parallel with Phase 3
- **US3 (Phase 6)**: Requires Phase 3 complete (toggle and labels live in NotebooksPage from T005)
- **Polish (Phase 7)**: Requires all story phases complete

### User Story Dependencies

- **US1 (P1)**: Requires Foundational — no dependency on other stories
- **US2 (P2)**: Requires US1 — sort validation builds on NotebooksPage from Phase 3
- **US4 (P2)**: Requires Foundational only — can begin after T001/T002
- **US3 (P3)**: Requires US1 — toggle/label validation builds on Phase 3

### Within Each Phase

- Tasks marked [P] operate on different files and can run in parallel
- Non-[P] tasks run sequentially in T-number order
- T001 and T002 are independent of each other (marked [P] relative to each other)

### Parallel Opportunities

- T001 and T002 can run in parallel (different new files)
- T003, T004, T006 can run in parallel within Phase 3 (different files)
- T007 and T008 can run in parallel within Phase 4 (different files)
- T012 and T013 can run in parallel within Phase 7 (independent verification)

---

## Parallel Example: Phase 3 (US1)

```
# These three can run in parallel:
T003 — NotebookCard.jsx       (pin button logic + props)
T004 — NotebookCard.module.css (pin button styles)
T006 — NotebooksPage.module.css (section label styles)

# T005 must wait for T003 (passes isPinned/onPinToggle props to NotebookCard):
T005 — NotebooksPage.jsx      (hook integration, sort, split, labels, toggle)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 2: Foundational (T001, T002)
2. Complete Phase 3: US1 (T003–T006)
3. **STOP and VALIDATE**: Pin one notebook, verify it appears at top, verify persistence on reload
4. Demo if ready

### Incremental Delivery

1. Phase 2 → Foundation ready
2. Phase 3 → US1: Basic pin flow (MVP!)
3. Phase 4 → US2: Multi-pin ordering confirmed
4. Phase 5 → US4: Per-user isolation confirmed
5. Phase 6 → US3: Unpin + label clear confirmed
6. Phase 7 → Polish: Edge cases and acceptance checklist

### Single Developer (Sequential)

Execute phases in order: 2 → 3 → 4 → 5 → 6 → 7.

---

## Notes

- [P] tasks = different files, no blocking dependencies on each other
- US2, US3, US4 phases are intentionally focused — their core logic is established in Phases 2–3; later phases confirm specific behaviors are correct
- All localStorage access in `pinStore.js` must be inside try/catch blocks
- All icons must use Lucide React `<Pin />` — no `f7-icons` font
- All new interactive elements require `data-testid` in `<component>-<action>` format
- Start the dev server with `pnpm dev` — never `npm` or `yarn`
