# Tasks: Edit Transaction

**Input**: Design documents from `specs/013-edit-transaction/`
**Branch**: `013-edit-transaction`
**Tests**: Not requested — manual validation per Constitution IX

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2)

---

## Phase 1: Setup

**Purpose**: No new packages or project structure changes needed — all dependencies are installed.

- [x] T001 Confirm `patch` is exported from `src/api/client.js` (read the file; if missing, add it alongside `get`, `post`, `del`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API function, mutation hook, card wiring, and page state that BOTH user stories depend on. Must be complete before any user story work begins.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [P] Add `updateTransaction(notebookId, transactionId, payload)` to `src/api/transactions.js` — import `patch` from `./client`; endpoint `PATCH /api/v1/notebooks/${notebookId}/transactions/${transactionId}`; export alongside existing functions
- [x] T003 [P] Create `src/hooks/useUpdateTransaction.js` — export `useUpdateTransaction(notebookId, transactionId)`; use `useMutation` from `@tanstack/react-query`; `mutationFn` calls `updateTransaction`; implement `onMutate` optimistic update (cancel queries with prefix `['transactions', notebookId]`, snapshot with `getQueriesData`, patch all matching cache entries with updated transaction fields via `setQueriesData`); `onError` restores snapshots; `onSettled` calls `invalidateQueries({ queryKey: ['transactions', notebookId] })`; import `queryClient` from `../queryClient`; show error toast via `f7` on failure — mirror `useUpdateNote` pattern exactly
- [x] T004 Add `onClick` prop to `src/components/transactions/TransactionCard.jsx` — accept `onClick` as a prop; add `onClick={onClick}` to the root `<div className={styles.card}>` element; add `data-testid` using the transaction id (e.g. `data-testid={\`transaction-card-${transaction.id}\`}`)
- [x] T005 Add edit state and sheet wiring to `src/pages/NotebookTransactionsPage.jsx` — add `const [editingTransaction, setEditingTransaction] = useState(null)` and `const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)`; add `function handleEditSheetClose() { setIsEditSheetOpen(false); setEditingTransaction(null) }`; wire `onClick` on each `<TransactionCard>` to `() => { setEditingTransaction(t); setIsEditSheetOpen(true) }`; import and render `<TransactionEditSheet transaction={editingTransaction} notebookId={id} tags={notebook.tags ?? []} opened={isEditSheetOpen} onClose={handleEditSheetClose} />` at the bottom of the page alongside other sheets
- [x] T006 [P] Create `src/components/transactions/TransactionEditSheet.module.css` — define classes: `.pageContent` (padding: 0 0 32px), `.header` (display flex; align-items center; gap 12px; padding 12px 16px 0), `.saveIndicator` (flex 1; display flex; justify-content center), `.typeRow` (display flex; gap 8px; padding 8px 16px), `.typeBtn` (flex 1; border-radius 10px; padding 10px; border 1.5px solid; cursor pointer; font-size 15px; font-weight 600; text-align center; background transparent), `.typeBtnActive` (background for active state set dynamically via inline color), `.amountList` and `.amountRow` and `.amountInput` and `.currency` (identical to `TransactionFormSheet.module.css` equivalents), `.dateRow` and `.calendarIcon` and `.dateLabel` and `.hiddenDateInput` (identical to `TransactionFormSheet.module.css` equivalents), `.tagsRow` and `.tagsChevron` (identical to `TransactionFormSheet.module.css` equivalents); all classes use CSS Modules; no static inline styles

**Checkpoint**: API, hook, card click, page state, and CSS all ready. User story implementation can begin.

---

## Phase 3: User Story 1 — Edit Amount and Type (Priority: P1) 🎯 MVP

**Goal**: User taps a transaction card, edit sheet opens pre-filled, changes amount or toggles income/expense type, changes auto-save with debounce and optimistic update, SaveStatusIndicator shows live state.

**Independent Test**: Tap a transaction card → sheet opens with correct amount and type pre-filled → change the amount → "Guardando…" appears after ~300ms → "Guardado" appears after save → no submit button visible → close sheet → transaction card shows updated amount.

- [x] T007 [US1] Scaffold `src/components/transactions/TransactionEditSheet.jsx` — functional component accepting props `{ transaction, notebookId, tags, opened, onClose }`; import `SaveStatusIndicator` from `../notes/SaveStatusIndicator`; import `useUpdateTransaction` from `../../hooks/useUpdateTransaction`; import `ChevronLeft, Calendar, ChevronRight` from `lucide-react`; import `Sheet, PageContent, List, ListInput, Block` from `framework7-react`; import `TagChip` from `../notebooks/TagChip`; import `styles` from `./TransactionEditSheet.module.css`; add `useRef` for `debounceRef` and `dateInputRef` and `amountRef`; add `useState` for `saveStatus` (initial `'saved'`), `amount`, `isExpense`, `selectedTagIds`; add `useEffect` to pre-fill all fields from `transaction` prop when `opened` changes to true; render basic `<Sheet opened={opened} onSheetClosed={onClose} swipeToClose backdrop style={{ height: 'auto' }}>` with `<PageContent className={styles.pageContent}>` shell — no fields yet
- [x] T008 [US1] Add sheet header with SaveStatusIndicator to `src/components/transactions/TransactionEditSheet.jsx` — inside `PageContent`, add `<div className={styles.header}>`; add `<button>` with `<ChevronLeft size={20} />` that calls `onClose` (with `data-testid="edit-transaction-close"`); add `<div className={styles.saveIndicator}><SaveStatusIndicator status={saveStatus} /></div>`; add empty spacer div matching ChevronLeft width for centering (depends on T007)
- [x] T009 [US1] Add income/expense type toggle to `src/components/transactions/TransactionEditSheet.jsx` — add `<div className={styles.typeRow}>` with two buttons: "Ingreso" and "Gasto"; active button styled via `styles.typeBtnActive` with dynamic border/text color (income = green `#16A34A`, expense = red `#FF3B30` — inline dynamic values, permitted by Constitution XI); clicking a type button: set `isExpense` local state, `setSaveStatus('editing')`, reset debounce timer, call mutation with `{ value: isExpense ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)) }`; add `data-testid="edit-transaction-type-income"` and `data-testid="edit-transaction-type-expense"` (depends on T008)
- [x] T010 [US1] Add amount input with debounced auto-save to `src/components/transactions/TransactionEditSheet.jsx` — add `<List className={styles.amountList}>` with `<li className={styles.amountRow}>`; add `<span className={styles.currency}>Bs.</span>` and `<input ref={amountRef} type="number" inputMode="decimal" placeholder="0" value={amount} onChange={handleAmountChange} className={styles.amountInput} data-testid="edit-transaction-amount" />`; implement `handleAmountChange(e)`: set `amount` state, `setSaveStatus('editing')`, `clearTimeout(debounceRef.current)`, set new 300ms timeout that validates amount then calls `mutate({ value }, { onSuccess: () => setSaveStatus('saved'), onError: () => setSaveStatus('error') })`; skip mutation if amount is empty, zero, or NaN (depends on T009)
- [x] T011 [US1] Handle sheet close during in-flight save in `src/components/transactions/TransactionEditSheet.jsx` — add `isSaving` derived state (`saveStatus === 'saving'`); pass `swipeToClose={!isSaving}` to the Sheet so swipe-to-close is blocked during save; replace the `onClose` prop call in the header close button with a `handleClose` function that: if `isSaving`, waits (the Sheet's `onSheetClosed` will fire once the save completes and `swipeToClose` re-enables); otherwise calls `onClose` directly; ensure `onSheetClosed` on the Sheet always calls `onClose` so the parent state is reset (depends on T010)

**Checkpoint**: US1 fully testable — tapping a card opens pre-filled sheet, amount and type edit auto-saves with status indicator.

---

## Phase 4: User Story 2 — Edit Content, Date, and Tags (Priority: P2)

**Goal**: User can change the description, date, and tags on an existing transaction, each change auto-saving independently.

**Independent Test**: Open edit sheet → change description text → "Guardando…" after 300ms → "Guardado"; change date → saves immediately; open tag selection → add/remove tag → saves automatically → sheet reflects updated tags.

- [x] T012 [US2] Add description/content input to `src/components/transactions/TransactionEditSheet.jsx` — add `<List>` with `<ListInput type="text" placeholder="Descripción" value={content} onInput={handleContentChange} clearButton data-testid="edit-transaction-description" />`; implement `handleContentChange(e)`: set `content` state, `setSaveStatus('editing')`, reset debounce, after 300ms call `mutate({ content: e.target.value.trim() || '' }, ...)` (depends on T010, as it shares the same debounce timer and save pattern)
- [x] T013 [US2] Add date picker row to `src/components/transactions/TransactionEditSheet.jsx` — add `<div className={styles.dateRow} onClick={openDatePicker} data-testid="edit-transaction-date-picker">`; render `<Calendar size={20} className={styles.calendarIcon} />`, `<span className={styles.dateLabel}>{formatDateDisplay(date)}</span>`, and `<input ref={dateInputRef} type="date" value={date} onChange={handleDateChange} className={styles.hiddenDateInput} />`; implement `handleDateChange(e)`: set `date` state, `setSaveStatus('saving')`, call `mutate({ date: e.target.value }, { onSuccess: ..., onError: ... })` immediately (no debounce — date selection is a discrete action) (depends on T012)
- [x] T014 [US2] Add tags row and tag selection wiring to `src/components/transactions/TransactionEditSheet.jsx` — add local `selectedTagIds` state initialized from `transaction.tags ?? []`; add `tagSheetOpen` state; resolve tag objects from `tags` prop using `selectedTagIds`; render `<div className={styles.tagsRow} onClick={() => setTagSheetOpen(true)} data-testid="edit-transaction-tags-row">`  with `<TagChip>` for each resolved tag and `<ChevronRight size={16} className={styles.tagsChevron} />`; render `<TagSelectionSheet opened={tagSheetOpen} tags={tags} selectedTagIds={selectedTagIds} onConfirm={handleTagsConfirm} onClose={() => setTagSheetOpen(false)} onEditTags={() => {}} />`; implement `handleTagsConfirm(newIds)`: convert Set to Array, set `selectedTagIds`, `setSaveStatus('saving')`, call `mutate({ tags: [...newIds] }, { onSuccess: ..., onError: ... })` immediately; import `TagSelectionSheet` from `./TagSelectionSheet` (depends on T013)

**Checkpoint**: US2 fully testable — description, date, and tag edits each auto-save independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Reset state on close, error feedback, and pre-fill robustness.

- [x] T015 Reset all local state when sheet closes in `src/components/transactions/TransactionEditSheet.jsx` — in the `useEffect` that watches `opened`: when `opened` becomes `false`, call `clearTimeout(debounceRef.current)` and reset `saveStatus` to `'saved'`; when `opened` becomes `true`, re-initialize all fields from `transaction` prop to ensure stale values are never shown
- [x] T016 Add error toast on save failure in `src/components/transactions/TransactionEditSheet.jsx` — in each mutation's `onError` callback, call `f7.toast.create({ text: 'Error al guardar. Intenta de nuevo.', closeTimeout: 3000, position: 'top' }).open()`; import `f7` from `framework7-react`; `onError` also calls `setSaveStatus('error')` (the optimistic rollback is already handled by `useUpdateTransaction`)
- [x] T017 Validate and run the app manually against the quickstart test scenarios in `specs/013-edit-transaction/quickstart.md` — open transactions list, tap a card, verify all fields pre-fill, test each field change, test network error path (disable network in DevTools), test close-during-save behavior

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 completion — **blocks all user story work**
  - T002 and T003 are parallel (different files)
  - T004 and T006 are parallel (different files)
  - T005 depends on T002, T003, T004 (needs hook + API + card prop)
- **User Story 1 (Phase 3)**: Depends on T002–T006 all complete
  - T007 → T008 → T009 → T010 → T011 (sequential, same file)
- **User Story 2 (Phase 4)**: Depends on Phase 3 complete (T012–T014 extend the same component)
  - T012 → T013 → T014 (sequential, same file)
- **Polish (Phase 5)**: Depends on Phase 4 complete

### Within Each User Story

- US1: All tasks are sequential (they all modify `TransactionEditSheet.jsx`)
- US2: All tasks are sequential (same file)
- T002 + T003 + T006: Parallel (three different files)
- T004 + T006: Parallel (different files)

### Parallel Opportunities

```
# Phase 2 — run in parallel:
T002  Add updateTransaction to src/api/transactions.js
T003  Create src/hooks/useUpdateTransaction.js
T006  Create src/components/transactions/TransactionEditSheet.module.css
        ↓ (T002 + T003 done)
T004  Add onClick prop to src/components/transactions/TransactionCard.jsx
        ↓ (T002 + T003 + T004 done)
T005  Wire edit state in src/pages/NotebookTransactionsPage.jsx

# Phase 3 — sequential (same file):
T007 → T008 → T009 → T010 → T011

# Phase 4 — sequential (same file):
T012 → T013 → T014
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Confirm `patch` export
2. Complete Phase 2: API + hook + card + page + CSS (T002–T006)
3. Complete Phase 3: Amount + type edit with auto-save (T007–T011)
4. **STOP and VALIDATE**: Tap card → sheet opens → edit amount → "Guardado"
5. If validated, continue to Phase 4

### Incremental Delivery

1. Phase 1 + 2 → Infrastructure ready
2. Phase 3 → Amount/type editing works (US1 ✅)
3. Phase 4 → All fields editable (US2 ✅)
4. Phase 5 → Polish, error handling, reset

---

## Notes

- [P] tasks can run in parallel (different files)
- [Story] label maps each task to its user story for traceability
- No unit tests per Constitution IX — validate manually at each checkpoint per `quickstart.md`
- `TransactionEditSheet` shares the debounce timer across all text fields — the last field changed wins. Date and tags bypass the debounce entirely (discrete actions)
- Constitution XIV: every interactive element must have `data-testid` — see T004, T009, T010, T012, T013, T014
- The `patch` function in `src/api/client.js` must be verified in T001 before T002 can be written
