# Tasks: Soporte de Notebooks de Transacciones

**Input**: Design documents from `/specs/010-transactions-notebook-support/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No test tasks — spec specifies manual validation only (Constitución IX: Velocity over Ceremony).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Maps to user story in spec.md (US1–US4)

---

## Phase 1: Setup

**Purpose**: Confirm no new npm dependencies are required; all needed packages already present.

- [x] T001 Verify `framework7-react` `<Radio>`, `<Fab>`, `<Toast>` are available in the installed Framework7 version by checking `package.json` and the Framework7 component catalog — no new installs required

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Routing infrastructure that MUST exist before any user story page can be navigated to.

**⚠️ CRITICAL**: No user story page work can begin until this phase is complete.

- [x] T002 Add routes `/notebooks/:id/notes` → `NotebookDetailPage` and `/notebooks/:id/transactions` → `NotebookTransactionsPage` to the `routes` array in `src/App.jsx`; add import for `NotebookTransactionsPage` (file will be created in Phase 4)

**Checkpoint**: Routes exist — pages can now be navigated to once implemented.

---

## Phase 3: User Story 1 — Crear y Editar Notebook con `type` (Priority: P1) 🎯 MVP

**Goal**: Un usuario puede crear o editar un Notebook eligiendo su tipo (`'notes'` | `'transactions'`); la navegación a `/notebooks/:id` redirige al sub-route correcto según el tipo.

**Independent Test**: Crear un Notebook nuevo, seleccionar tipo "transactions", guardar — verificar redirección a `/notebooks/:id/transactions`. Editar ese Notebook, cambiar a "notes" — verificar redirección a `/notebooks/:id/notes`.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create `TypeSelector` component (Radio Button de F7 con opciones "Notas" / "Transacciones", props: `value`, `onChange`) in `src/components/notebooks/TypeSelector.jsx` and `src/components/notebooks/TypeSelector.module.css`
- [x] T004 [P] [US1] Update `src/api/notebooks.js` `createNotebook` function to verify it passes through all payload fields generically (no hardcoding; `type` should flow through automatically if payload is spread)
- [x] T005 [US1] Update `src/pages/CreateNotebookPage.jsx` to add `<TypeSelector>` after the icon/color fields, initialize `type` state to `'notes'`, and include `type` in the `useCreateNotebook` mutation payload
- [x] T006 [US1] Update `src/pages/EditNotebookPage.jsx` to add `<TypeSelector>` initialized from `notebook.type`, and include `type` in the `useUpdateNotebook` mutation payload (optimistic update already handled by the hook)
- [x] T007 [US1] Update `src/pages/NotebookDetailPage.jsx` to read `notebook.type` from `useNotebook(id)` and call `f7router.navigate` with `replace: true` to `/notebooks/${id}/notes` or `/notebooks/${id}/transactions` once data is loaded

**Checkpoint**: User Story 1 fully functional — notebook type can be set, edited, and navigation is conditional. ✅

---

## Phase 4: User Story 2 — Ver Transacciones por Mes (Priority: P2)

**Goal**: Un Notebook de tipo `'transactions'` con `transactionsViewType: 'by-month'` muestra el `MonthSelector` con el mes actual, el balance del mes, y la lista de `TransactionCard` filtrada. Navegación entre meses actualiza la lista.

**Independent Test**: Hardcodear `transactionsViewType: 'by-month'` en un Notebook de prueba, navegar a `/notebooks/:id/transactions`, verificar que aparece el `MonthSelector` con el mes actual y que las transacciones de ese mes se listan correctamente con color de monto.

### Implementation for User Story 2

- [x] T008 [P] [US2] Create `TransactionCard` component (props: `transaction`) with layout: descripción izquierda + monto derecha con clases `.negative`/`.positive`/`.neutral`, fila inferior con `<TagChip>` por tag y fecha relativa, in `src/components/transactions/TransactionCard.jsx` and `src/components/transactions/TransactionCard.module.css`
- [x] T009 [P] [US2] Create `TransactionEmptyState` component (mensaje "Sin movimientos en este período") following the same visual pattern as `src/components/notes/NoteEmptyState.jsx`, in `src/components/transactions/TransactionEmptyState.jsx` and `src/components/transactions/TransactionEmptyState.module.css`
- [x] T010 [P] [US2] Create `MonthSelector` component (props: `year`, `month` 1–12, `total`, `onPrev`, `onNext`) with chevron_left/chevron_right `<Button>` icons from Framework7-Icons, centered month label via `toLocaleDateString('es', {month:'long', year:'numeric'})`, and balance row with conditional color class, in `src/components/transactions/MonthSelector.jsx` and `src/components/transactions/MonthSelector.module.css`
- [x] T011 [P] [US2] Create `useTransactions` hook: consumes `useNotebook(notebookId)`, returns `notebook.transactions` filtered by `{year, month}` when provided (using `new Date(t.date)` comparison), returns full array when no filter given, in `src/hooks/useTransactions.js`
- [x] T012 [US2] Create `NotebookTransactionsPage` with: Navbar (notebook title + edit icon → `/notebooks/:id/edit`), `MonthCursor` local state initialized to current month (`new Date()`), `by-month` branch rendering `<MonthSelector>` + filtered `<TransactionCard>` list or `<TransactionEmptyState>`, in `src/pages/NotebookTransactionsPage.jsx` and `src/pages/NotebookTransactionsPage.module.css` (depends on T008–T011)

**Checkpoint**: User Story 2 fully functional — `by-month` view renders and month navigation works. ✅

---

## Phase 5: User Story 3 — Configurar Vista desde Ajustes (Priority: P3)

**Goal**: Un usuario puede cambiar `transactionsViewType` (`'all'` | `'by-month'`) desde la página de edición del Notebook. La vista de transacciones respeta el valor guardado.

**Independent Test**: Ir a edición del Notebook, cambiar `transactionsViewType` a `'all'`, guardar, navegar a `/notebooks/:id/transactions` — verificar que no aparece `MonthSelector` y se muestra la lista completa con balance total.

### Implementation for User Story 3

- [x] T013 [US3] Extend `NotebookTransactionsPage` to handle the `'all'` branch: render balance total acumulado (suma de todos los `transaction.amount`) seguido de la lista completa de `<TransactionCard>` o `<TransactionEmptyState>` — `src/pages/NotebookTransactionsPage.jsx`
- [x] T014 [US3] Update `src/pages/EditNotebookPage.jsx` to add a `transactionsViewType` Radio Button selector (`'all'` / `'by-month'`) rendered conditionally when `notebook.type === 'transactions'`, initialized from `notebook.transactionsViewType`, included in the `useUpdateNotebook` mutation payload

**Checkpoint**: User Story 3 fully functional — `transactionsViewType` configurable in settings, both view modes render correctly. ✅

---

## Phase 6: User Story 4 — Botón de Creación Placeholder (Priority: P4)

**Goal**: La vista de transacciones muestra un FAB "+" que responde al tap con un toast "Próximamente" sin errores.

**Independent Test**: Navegar a `/notebooks/:id/transactions`, verificar que el `<Fab>` naranja aparece en la esquina inferior derecha y que al presionarlo aparece el toast "Próximamente".

### Implementation for User Story 4

- [x] T015 [US4] Add `<Fab position="right-bottom">` with "+" icon and `f7.toast.create({ text: 'Próximamente' })` handler to `NotebookTransactionsPage` — `src/pages/NotebookTransactionsPage.jsx`

**Checkpoint**: User Story 4 fully functional — FAB visible y funcional como placeholder. ✅

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verificación de integración y consistencia visual en toda la app.

- [x] T016 [P] Audit all existing calls to `f7router.navigate('/notebooks/:id')` in `src/components/notebooks/NotebookCard.jsx` and `src/pages/NotebooksPage.jsx` to confirm they route through the conditional redirect in `NotebookDetailPage` without changes needed
- [x] T017 [P] Update spec Assumptions section to replace placeholder enum names (`ALL_ENTRIES`/`BY_MONTH`) with confirmed backend values (`'all'`/`'by-month'`) if not already done — `specs/010-transactions-notebook-support/spec.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 — BLOCKS all page navigation
- **Phase 3 (US1)**: Depends on Phase 2 — can start once routes exist
- **Phase 4 (US2)**: Depends on Phase 2 — can start in parallel with Phase 3
- **Phase 5 (US3)**: Depends on Phase 4 (NotebookTransactionsPage must exist to extend it)
- **Phase 6 (US4)**: Depends on Phase 4 (NotebookTransactionsPage must exist)
- **Phase 7 (Polish)**: Depends on Phases 3–6 complete

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories — first independent deliverable
- **US2 (P2)**: No dependency on US1 components — can start from Phase 2 in parallel with US1
- **US3 (P3)**: Depends on US2 (extends `NotebookTransactionsPage` and `EditNotebookPage`)
- **US4 (P4)**: Depends on US2 (adds to `NotebookTransactionsPage`)

### Within Each Phase

- Tasks marked [P] can run in parallel
- T012 (NotebookTransactionsPage) depends on T008, T009, T010, T011 being complete
- T013, T015 depend on T012 (same file)
- T005, T006 depend on T003 (TypeSelector must exist before it's imported)

---

## Parallel Opportunities

### Phase 3 (US1) — can parallelize 3 tracks

```
Track A: T003 → T005 (TypeSelector → CreateNotebookPage)
Track B: T003 → T006 (TypeSelector → EditNotebookPage)
Track C: T004, T007 (api + NotebookDetailPage — independent)
```

### Phase 4 (US2) — can parallelize 4 tracks simultaneously

```
Track A: T008  (TransactionCard)
Track B: T009  (TransactionEmptyState)
Track C: T010  (MonthSelector)
Track D: T011  (useTransactions hook)
→ All converge at T012 (NotebookTransactionsPage)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002)
3. Complete Phase 3: US1 (T003–T007)
4. **STOP and VALIDATE**: Crear notebook con tipo transactions, verificar redirección
5. Demo si listo

### Incremental Delivery

1. Phase 1 + Phase 2 → Routing listo
2. Phase 3 (US1) → Notebooks tienen tipo, navegación condicional funciona ✅
3. Phase 4 (US2) → Vista by-month con transacciones reales ✅
4. Phase 5 (US3) → Vista all + selector en ajustes ✅
5. Phase 6 (US4) → FAB placeholder ✅
6. Phase 7 → Polish ✅

---

## Notes

- [P] tasks = archivos distintos, sin dependencias entre sí — pueden ejecutarse en paralelo
- [US#] label mapea cada tarea a su user story para trazabilidad
- `TransactionCard` reutiliza `<TagChip>` de `src/components/notebooks/TagChip.jsx` — no duplicar
- Color de monto usa clases CSS condicionales (`styles.negative`/`.positive`/`.neutral`), nunca `style={{ color }}`
- El `<Fab>` usa `f7.toast.create()` — no crear estado React para el toast
- `MonthCursor` (`{ year, month }`) es estado local de `NotebookTransactionsPage` — no persiste en servidor ni en localStorage
