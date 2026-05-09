# Tasks: Añadir Transacción a un Notebook

**Input**: Design documents from `/specs/011-add-transaction/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No test tasks — manual validation only (Constitución IX).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Maps to user story in spec.md (US1–US3)

---

## Phase 1: Setup

**Purpose**: Corrección crítica de campo names antes de añadir nueva funcionalidad.

- [x] T001 Fix `TransactionCard.jsx`: rename `transaction.amount` → `transaction.value`, `transaction.description` → `transaction.content`, and update local variable `amount` → `value` in `formatAmount` function and className conditional — `src/components/transactions/TransactionCard.jsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API layer y mutation hook que todas las user stories necesitan para persistir datos.

**⚠️ CRITICAL**: Las fases US1–US3 dependen de estos dos artefactos.

- [x] T002 [P] Create `src/api/transactions.js` with `createTransaction(notebookId, payload)` calling `post('/api/v1/notebooks/${notebookId}/transactions', payload)` using the existing `post` helper from `src/api/client.js`
- [x] T003 [P] Create `src/hooks/useCreateTransaction.js`: `useMutation` hook receiving `notebookId` as hook param, `mutationFn: (payload) => createTransaction(notebookId, payload)`, `onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notebook', notebookId] })` — no optimistic update

**Checkpoint**: API layer ready — user story sheets can now call `useCreateTransaction`. ✅

---

## Phase 3: User Story 1 — Añadir Transacción con Etiquetas (Priority: P1) 🎯 MVP

**Goal**: En un Notebook con etiquetas, presionar el FAB Speed Dial → elegir "Gasto"/"Ingreso" → seleccionar etiquetas → completar formulario → guardar transacción con signo y etiquetas correctas.

**Independent Test**: Notebook con etiquetas → FAB Speed Dial expande 2 botones (rojo/verde) → elegir "Gasto" → TagSelectionSheet aparece con etiquetas del notebook → seleccionar una → "Confirmar" → TransactionFormSheet aparece con autofocus en monto → ingresar valor → "Añadir Gasto" → transacción aparece en lista con monto negativo y etiqueta asignada.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create `TagSelectionSheet` component: `<Sheet>` with header ("Categoría" title + "Editar" button navigating to `/notebooks/:id/edit`), scrollable list of `<ListItem checkbox>` per tag (f7-icons icon in media slot + tag.title), "Confirmar" `<Button>` footer calling `onConfirm(newSelectedIds)` — props: `opened`, `tags`, `selectedTagIds`, `onConfirm`, `onClose`, `notebookId` — in `src/components/transactions/TagSelectionSheet.jsx` and `src/components/transactions/TagSelectionSheet.module.css`

- [x] T005 [P] [US1] Create `TransactionFormSheet` component: `<Sheet>` with back-arrow header (calls `onBack()`), selected tags row (TagChip chips), `<ListInput type="number" inputmode="decimal">` with "Bs." prefix and `autoFocus`, `<ListInput type="text">` for content (optional), `<input type="date">` with calendar icon and today's default, submit `<Button>` labeled "Añadir Gasto"/"Añadir Ingreso" per `transactionType` — submit applies sign (`expense → -Math.abs(val)`, `income → +Math.abs(val)`) then calls `mutate({value, date, content, tags})` — props: `opened`, `transactionType`, `selectedTags`, `notebookId`, `onBack`, `onClose`, `onSuccess` — in `src/components/transactions/TransactionFormSheet.jsx` and `src/components/transactions/TransactionFormSheet.module.css`

- [x] T006 [US1] Replace placeholder `<Fab>` in `NotebookTransactionsPage` with Speed Dial: import `FabButtons`, `FabButton`, `FabBackdrop` from `framework7-react`; add flow state (`transactionType`, `selectedTagIds`, `isTagSheetOpen`, `isFormSheetOpen`); implement `handleTypeSelect`, `handleTagsConfirm`, `handleFormBack`, `handleFlowClose` handlers; wire `<TagSelectionSheet>` and `<TransactionFormSheet>` — add `.expenseBtn` (background `#e53935`) and `.incomeBtn` (background `#43a047`) CSS classes in `src/pages/NotebookTransactionsPage.module.css` — `src/pages/NotebookTransactionsPage.jsx`

**Checkpoint**: US1 fully functional — Speed Dial, both sheets, tag selection, form submission, and list update all working. ✅

---

## Phase 4: User Story 2 — Añadir Transacción sin Etiquetas (Priority: P2)

**Goal**: En un Notebook sin etiquetas, el Speed Dial abre directamente `TransactionFormSheet` sin pasar por `TagSelectionSheet`.

**Independent Test**: Notebook sin etiquetas → FAB Speed Dial → elegir "Ingreso" → `TransactionFormSheet` se abre directamente (sin TagSelectionSheet) → ingresar monto → guardar → transacción aparece con monto positivo y sin etiquetas.

### Implementation for User Story 2

- [x] T007 [US2] Verify `handleTypeSelect` in `NotebookTransactionsPage` correctly branches: `if (notebook.tags.length > 0) setIsTagSheetOpen(true); else setIsFormSheetOpen(true)` — also verify `handleFormBack` does NOT open TagSelectionSheet when `notebook.tags.length === 0` — `src/pages/NotebookTransactionsPage.jsx`

**Checkpoint**: US2 fully functional — direct form flow without tags works correctly. ✅

---

## Phase 5: User Story 3 — Seleccionar Fecha de la Transacción (Priority: P3)

**Goal**: En el formulario, la fecha muestra hoy por defecto y el usuario puede elegir otra fecha que se incluye al guardar.

**Independent Test**: Abrir TransactionFormSheet → campo fecha muestra fecha de hoy en español (ej. "9 de mayo de 2026") → presionar campo → selector nativo del dispositivo abre → seleccionar otra fecha → "Añadir Gasto" → verificar que la transacción guardada tiene la fecha seleccionada (no la de hoy).

### Implementation for User Story 3

- [x] T008 [US3] Verify `TransactionFormSheet` date field: `<input type="date">` initialized with `new Date().toISOString().split('T')[0]`; display label formatted with `toLocaleDateString('es', { day:'numeric', month:'long', year:'numeric' })`; value included in submit payload as ISO string — `src/components/transactions/TransactionFormSheet.jsx`

**Checkpoint**: US3 fully functional — date selection works and persists correctly. ✅

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, UX edge cases, and flow state consistency.

- [x] T009 [P] Add error toast in `TransactionFormSheet` `onError` handler: `f7.toast.create({ text: 'Error al guardar. Intenta de nuevo.', closeTimeout: 3000 }).open()` without closing the sheet (preserves form data) — `src/components/transactions/TransactionFormSheet.jsx`
- [x] T010 [P] Add loading state to submit button in `TransactionFormSheet`: disable button and show "Guardando..." text while `isPending` from `useCreateTransaction` — `src/components/transactions/TransactionFormSheet.jsx`
- [x] T011 [P] Verify `FabBackdrop` `onClick` calls `handleFlowClose` which resets all flow state (transactionType → null, selectedTagIds → empty Set, both sheets closed) — `src/pages/NotebookTransactionsPage.jsx`
- [x] T012 [P] Verify `TagSelectionSheet` `onSheetClosed` (swipe-to-close gesture) calls `onClose` without modifying `selectedTagIds` state in parent — `src/components/transactions/TagSelectionSheet.jsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — fix field names first to avoid confusion
- **Phase 2 (Foundational)**: Depends on Phase 1 — T002 and T003 can run in parallel
- **Phase 3 (US1)**: Depends on Phase 2 — T004 and T005 can run in parallel; T006 depends on T004 + T005
- **Phase 4 (US2)**: Depends on T006 being complete (same file)
- **Phase 5 (US3)**: Depends on T005 being complete (same file)
- **Phase 6 (Polish)**: Depends on Phases 3–5

### User Story Dependencies

- **US1 (P1)**: Requires Foundational (T002, T003) — main deliverable
- **US2 (P2)**: Requires US1 (T006) — branch logic in the same page component
- **US3 (P3)**: Requires US1 (T005) — date field is inside TransactionFormSheet

### Within Each Phase

- T004 and T005 are fully parallel (different files)
- T006 depends on both T004 and T005 (imports both sheets)
- T009 and T010 touch the same file — run sequentially

---

## Parallel Opportunities

### Phase 2 — run both simultaneously
```
Track A: T002 (src/api/transactions.js)
Track B: T003 (src/hooks/useCreateTransaction.js)
```

### Phase 3 — run sheet components simultaneously, then integrate
```
Track A: T004 (TagSelectionSheet.jsx + .module.css)
Track B: T005 (TransactionFormSheet.jsx + .module.css)
→ Converge at T006 (NotebookTransactionsPage Speed Dial integration)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Fix TransactionCard fields (T001)
2. Phase 2: API + Hook (T002, T003)
3. Phase 3: Both sheets + Speed Dial integration (T004–T006)
4. **STOP and VALIDATE**: Test full flow in a notebook with tags
5. Demo if ready

### Incremental Delivery

1. Phase 1 + Phase 2 → Infrastructure ready
2. Phase 3 (US1) → Full two-step flow works with tags ✅
3. Phase 4 (US2) → Direct flow without tags works ✅
4. Phase 5 (US3) → Date selection works ✅
5. Phase 6 → Polish and error handling ✅

---

## Notes

- [P] tasks = different files, no cross-dependencies
- T001 (field name fix) MUST run before any other task to avoid confusion with wrong field names
- `TransactionFormSheet` uses `useCreateTransaction(notebookId)` — `notebookId` comes from props
- The Speed Dial `<Fab>` in `NotebookTransactionsPage` already exists as placeholder — replace, don't add new
- `TagChip` in `TransactionFormSheet` receives full tag objects (filtered from `notebook.tags` by parent using `selectedTagIds`)
- Tag IDs sent to API: use `tag.id` (not `tag._id`) — consistent with how backend returns tags
