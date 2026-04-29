---
description: "Task list for Notebooks UI"
---

# Tasks: Notebooks UI

**Input**: Design documents from `/specs/002-notebooks-ui/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No test tasks — per Principle IX (Velocity over Ceremony).

**Organization**: Tasks grouped by user story for independent implementation and validation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2)
- Exact file paths in every description

---

## Phase 1: Setup

**Purpose**: Remove the placeholder home page before building the replacement.

- [x] T001 Delete `src/pages/HomePage.jsx` — this file is replaced entirely by
  `src/pages/NotebooksPage.jsx` in Phase 3. Removal avoids confusion with the old
  health-check content.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: API layer and hooks that both user stories depend on.

**⚠ CRITICAL**: T003 and T004 depend on T002. Complete T002 first, then T003 and T004
can run in parallel.

- [x] T002 Create `src/api/notebooks.js` — export two functions:
  `fetchNotebooks()` calls `get('/api/v1/notebooks')` using the existing `get` helper
  from `src/api/client.js`; response shape is `{ success, data: Notebook[], timestamp }`.
  `createNotebook(payload)` calls `post('/api/v1/notebooks', payload)` — add a `post`
  helper to `src/api/client.js` that sends JSON with method POST and returns
  `response.json()`, mirroring the existing `get` helper (inject auth header and handle
  401 identically).

- [x] T003 [P] Create `src/hooks/useNotebooks.js` — export `useNotebooks()` that calls
  `useQuery({ queryKey: ['notebooks'], queryFn: fetchNotebooks })` imported from
  `src/api/notebooks.js`.

- [x] T004 [P] Create `src/hooks/useCreateNotebook.js` — export `useCreateNotebook()`
  that calls `useMutation` with:
  - `mutationFn: createNotebook` from `src/api/notebooks.js`
  - `onMutate`: cancel `['notebooks']` queries, snapshot current data, inject an
    optimistic entry at the front of `data` array with
    `id: \`temp-${Date.now()}\``, all provided payload fields,
    `owner: getSession().user.googleId`, `users: payload.users ?? []`,
    `createdAt`/`updatedAt: new Date().toISOString()`.
    Return `{ previous }` as rollback context.
  - `onError`: restore `queryClient.setQueryData(['notebooks'], context.previous)`.
  - `onSettled`: call `queryClient.invalidateQueries({ queryKey: ['notebooks'] })`.
  Import `queryClient` from `src/queryClient.js` and `getSession` from
  `src/stores/authStore.js`.

**Checkpoint**: API and hooks are available. Both user stories can now proceed.

---

## Phase 3: User Story 1 — Notebooks Home Page (Priority: P1) 🎯 MVP

**Goal**: Authenticated user sees the "Lachiwana" navbar with their avatar, a list of
notebooks (owned + member), an empty-state placeholder when none exist, and the
"Crear Cuaderno" FAB.

**Independent Test**: Sign in → home page loads → navbar shows "Lachiwana" + avatar →
notebooks list or empty-state renders → FAB is visible. US2 (creation) not required.

### Implementation for User Story 1

- [x] T005 [P] [US1] Create `src/components/notebooks/NotebookCard.jsx` — renders a
  single F7 `Card` for one notebook. Left side: a 6px-wide vertical color strip using
  `notebook.color` as `backgroundColor` (fallback: `var(--f7-theme-color)`). Center: an
  F7 icon `<i className="f7-icons">` using `notebook.iconName` (fallback: `book`),
  and the `notebook.title` below it as text. No additional content — minimalist card.
  Props: `{ notebook }`.

- [x] T006 [P] [US1] Create `src/components/notebooks/NotebookEmptyState.jsx` — renders
  a centered F7 `Block` with a large `book` F7 icon above the text
  "No tienes cuadernos creados". No button — the FAB handles creation. Style: centered
  flex column, muted text color `var(--f7-block-text-color)`, icon size 64px.

- [x] T007 [US1] Create `src/pages/NotebooksPage.jsx` — the main home page:
  (a) `Navbar` with `title="Lachiwana"` and a right slot containing the logged-in
  user's avatar: read `getSession().user.picture` from `src/stores/authStore.js`;
  render a 36×36 circular `<img>` if present, otherwise an F7 `person_circle` icon.
  (b) Call `useNotebooks()` from `src/hooks/useNotebooks.js`.
  (c) Show `Preloader` while loading; show an error message with a retry link on error.
  (d) When `data?.data` is empty show `<NotebookEmptyState />`.
  (e) When notebooks exist render each as `<NotebookCard notebook={n} />` inside a
  scrollable `Block`.
  (f) F7 `Fab` positioned `right-bottom` with label "Crear Cuaderno";
  on click: `f7router.navigate('/notebooks/create')`.
  Import `NotebookCard` from `../components/notebooks/NotebookCard`,
  `NotebookEmptyState` from `../components/notebooks/NotebookEmptyState`.

- [x] T008 [US1] Update `src/App.jsx` — replace the existing `{ path: '/', component: ProtectedHome }`
  route: change `ProtectedHome` to wrap `NotebooksPage` instead of `HomePage`.
  Import `NotebooksPage` from `./pages/NotebooksPage`. Remove the `HomePage` import.

**Checkpoint**: Home page is fully functional. Sign in → see notebooks (or empty state)
with toolbar and FAB. US2 (creation form) not yet wired.

---

## Phase 4: User Story 2 — Create a Notebook (Priority: P2)

**Goal**: User taps "Crear Cuaderno", fills in title + optional fields including a
searchable multi-user member picker, submits, and the new notebook appears instantly
in the home page list via optimistic UI.

**Independent Test**: From home page tap FAB → creation page renders → enter title →
select members → submit → land on home page → new notebook card appears immediately.

### Implementation for User Story 2

- [x] T009 [P] [US2] Create `src/components/notebooks/MemberPicker.jsx` — a controlled
  component with props `{ allUsers, selectedIds, onChange, excludeId }`.
  Internally manages `{ isOpen, searchQuery }` state.
  Renders: (a) a tappable summary row showing selected count (e.g., "2 miembros
  seleccionados") that opens the sheet on tap; (b) an F7 `Sheet` (`opened={isOpen}`
  `onSheetClose`) containing an F7 `Searchbar` that updates `searchQuery` on change,
  a scrollable `List` of users filtered by `searchQuery` against `name` and `email`
  (case-insensitive), excluding the user with `excludeId`. Each user `ListItem` has
  a checkbox (`checkbox` prop), circular avatar `<img>` or `person_circle` icon in
  media slot, `title={user.name}`, `subtitle={user.email}`, and `checked` state driven
  by `selectedIds`. On checkbox change call `onChange` with the updated Set.
  (c) A "Listo" F7 `Button` at the bottom of the Sheet that closes it.

- [x] T010 [US2] Create `src/pages/CreateNotebookPage.jsx` — creation form page:
  (a) `Navbar` with `title="Nuevo Cuaderno"` and a back button (F7 default).
  (b) F7 `List` with `ListInput` for required Title (`type="text"`,
  `placeholder="Título"`, `required`, shows error if empty on submit attempt) and
  optional Description (`type="textarea"`, `placeholder="Descripción"`).
  (c) Color picker: a horizontal scrollable row of 8 circular swatches; the selected
  swatch has a checkmark overlay. Colors defined as
  `[{label:'Red',hex:'#FF3B30'}, {label:'Orange',hex:'#FF9500'}, ...]`
  (full palette from data-model.md).
  (d) Icon picker: a 4-column grid of 12 F7 icon buttons; tapping selects/deselects.
  Icons from data-model.md icon set.
  (e) `<MemberPicker>` connected to `allUsers` from `useUsers()`, `excludeId` from
  `getSession().user.googleId`, `selectedIds` state, `onChange` updating state.
  (f) A "Crear Cuaderno" submit `Button` (large, fill). On tap: validate title is
  non-empty; call `mutate({ title, description, color, iconName, users: [...selectedIds] })`
  from `useCreateNotebook()`; on success navigate to `/` via `f7router.navigate('/')`.
  (g) Show an F7 Toast or error block if mutation fails; preserve form data.
  Import `useCreateNotebook` from `../hooks/useCreateNotebook`,
  `useUsers` from `../hooks/useUsers`,
  `MemberPicker` from `../components/notebooks/MemberPicker`.

- [x] T011 [US2] Update `src/App.jsx` — add route
  `{ path: '/notebooks/create', component: ProtectedCreate }` where `ProtectedCreate`
  is a named wrapper: `const ProtectedCreate = () => <ProtectedRoute><CreateNotebookPage /></ProtectedRoute>`.
  Import `CreateNotebookPage` from `./pages/CreateNotebookPage`.

**Checkpoint**: Full creation flow works end-to-end. Optimistic entry appears on submit;
list syncs with server on settled.

---

## Phase 5: Polish & Cross-Cutting Concerns

- [x] T012 [P] Verify Principle VI compliance in `src/hooks/useCreateNotebook.js` —
  confirm `onMutate`, `onError` (rollback), and `onSettled` (invalidate) are all
  implemented. Verify no bare `fetch` in any new component file.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: T002 first; T003 and T004 parallel after T002.
  **Blocks all user stories.**
- **US1 (Phase 3)**: T005 and T006 parallel (no deps); T007 after T005+T006+T003;
  T008 after T007.
- **US2 (Phase 4)**: T009 parallel with US1 tasks (different files); T010 after
  T009+T004+T002; T011 after T010.
- **Polish (Phase 5)**: After all user stories complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only.
- **US2 (P2)**: Depends on Foundational + US1 (FAB must navigate to /notebooks/create
  which needs the route from T011).

### Within Each Story

- Components before pages (pages import components).
- Pages before App.jsx route updates.
- Story complete and manually tested before next.

### Parallel Opportunities

```bash
# Phase 2 parallel (after T002):
Task T003: Create src/hooks/useNotebooks.js
Task T004: Create src/hooks/useCreateNotebook.js

# Phase 3+4 parallel (T005, T006, T009 all touch different files):
Task T005: Create src/components/notebooks/NotebookCard.jsx
Task T006: Create src/components/notebooks/NotebookEmptyState.jsx
Task T009: Create src/components/notebooks/MemberPicker.jsx
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup (delete HomePage)
2. Complete Phase 2: Foundational (T002–T004)
3. Complete Phase 3: US1 (T005–T008)
4. **STOP and VALIDATE**: Home page renders, notebooks list + empty state + FAB work.
5. Proceed to US2 only after MVP validated.

### Incremental Delivery

1. Delete placeholder → build API/hooks → home page works (MVP)
2. Add MemberPicker → creation form → FAB wired → full flow works
3. Polish: optimistic UI audit

---

## Notes

- `[P]` tasks touch different files — safe to run in parallel
- `useCreateNotebook` optimistic pattern is the most complex task — allocate extra time
- `MemberPicker` is a custom component (Principle IV); no third-party select library
- `post` helper must be added to `src/api/client.js` as part of T002 (it does not exist yet)
- The `/notebooks/create` route is protected via `ProtectedRoute` wrapper (T011)
