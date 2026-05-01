---
description: "Task list for Notebook Detail View"
---

# Tasks: Notebook Detail View

**Input**: Design documents from `/specs/003-notebook-detail/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅

**Tests**: No test tasks — per Principle IX (Velocity over Ceremony).

**Organization**: Tasks grouped by user story for independent implementation and validation.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US3
- Exact file paths in every description

---

## Phase 1: Setup

No project-level setup required — extending an existing project.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: HTTP layer, API functions, and hooks that all three user stories depend on.
Complete T001 and T002 first (T002 depends on T001); then T003/T004/T005 in parallel.

- [x] T001 Update `src/api/client.js` — add two helpers after the existing `post` function:
  `patch(path, body)`: same structure as `post` but uses method `'PATCH'`.
  `del(path)`: sends a `DELETE` request with no body; returns `response.json()` only if
  response is not 204; if 204 returns `null`. Same auth header injection and 401 handling
  as `get`. Export both.

- [x] T002 Update `src/api/notebooks.js` — import `patch` and `del` from `./client`; add:
  `updateNotebook(id, payload)` → `patch(\`/api/v1/notebooks/${id}\`, payload)`;
  `deleteNotebook(id)` → `del(\`/api/v1/notebooks/${id}\`)`.

- [x] T003 [P] Create `src/hooks/useNotebook.js` — export `useNotebook(id)` that calls
  `useQuery({ queryKey: ['notebooks'], queryFn: fetchNotebooks, select: (data) => data?.data?.find(n => n.id === id) })`.
  The `select` reads from the already-cached list with zero extra network calls.
  If the query is not yet cached, `fetchNotebooks` fires automatically.

- [x] T004 [P] Create `src/hooks/useUpdateNotebook.js` — export `useUpdateNotebook()`:
  `useMutation` with `mutationFn: ({ id, ...payload }) => updateNotebook(id, payload)`.
  `onMutate`: cancel `['notebooks']` queries → snapshot → update the matching item:
  `old.data.map(n => n.id === variables.id ? { ...n, ...variables, updatedAt: new Date().toISOString() } : n)`.
  Return `{ previous }`.
  `onError`: restore `queryClient.setQueryData(['notebooks'], context.previous)`.
  `onSettled`: `queryClient.invalidateQueries({ queryKey: ['notebooks'] })`.
  Import `queryClient` from `src/queryClient.js`.

- [x] T005 [P] Create `src/hooks/useDeleteNotebook.js` — export `useDeleteNotebook()`:
  `useMutation` with `mutationFn: (id) => deleteNotebook(id)`.
  `onSuccess`: `queryClient.invalidateQueries({ queryKey: ['notebooks'] })`.
  No optimistic update — deletion waits for server confirmation per spec.
  Import `queryClient` from `src/queryClient.js`.

**Checkpoint**: API helpers, API functions, and all three hooks are available.

---

## Phase 3: User Story 1 — Open Notebook Detail (Priority: P1) 🎯 MVP

**Goal**: Tapping a notebook card navigates to `/notebooks/:id`. The detail page renders
the toolbar tinted with the notebook's color, showing its icon and title. An options
menu button is visible. "Notas vacías" placeholder is shown.

**Independent Test**: Tap any notebook card → URL changes to `/notebooks/:id` → toolbar
shows correct color/icon/title → "Notas vacías" visible → options button visible.

### Implementation for User Story 1

- [x] T006 [US1] Update `src/components/notebooks/NotebookCard.jsx` — wrap the Card's
  `onClick` or add an `href` prop: pass `href={\`/notebooks/${notebook.id}\`}` to the
  F7 `Card` component so F7's link interception navigates to the detail page without a
  full page reload. Remove any existing onClick if present.

- [x] T007 [US1] Create `src/pages/NotebookDetailPage.jsx` — a protected route page
  that receives `f7route` and `f7router` as props:
  (a) Read `const id = f7route.params.id`.
  (b) Call `useNotebook(id)` from `src/hooks/useNotebook.js`.
  (c) Loading state: render `Page` + centered `Preloader`.
  (d) Not-found / error state: render `Page` + centered message "Cuaderno no encontrado"
  with a `<span onClick={() => f7router.back()}>Volver</span>` link.
  (e) When notebook is loaded: render a `Page` with a `Navbar` styled as:
  `style={{ '--f7-navbar-bg-color': notebook.color ?? 'var(--f7-theme-color)', '--f7-navbar-link-color': '#fff', '--f7-navbar-text-color': '#fff' }}`.
  NavLeft: `<NavLeft backLink="Atrás" backLinkColor="white" />`.
  NavTitle: a flex row `<div style={{display:'flex',alignItems:'center',gap:'8px'}}>`
  containing `<i className="f7-icons" style={{color:'#fff',fontSize:'20px'}}>{notebook.iconName ?? 'book'}</i>`
  and `<span style={{color:'#fff'}}>{notebook.title}</span>`.
  NavRight: a button `<a onClick={() => setActionsOpen(true)} style={{color:'#fff',padding:'0 12px'}}>` with `<i className="f7-icons">ellipsis_vertical</i>`.
  (f) F7 `Actions` component (`opened={actionsOpen}` `onActionsClosed={() => setActionsOpen(false)}`):
  `ActionsGroup` with `ActionsButton`: "Editar" (onClick stub: `setActionsOpen(false)`),
  and if `notebook.owner === getSession().user.googleId`: another `ActionsButton`: "Eliminar"
  (onClick stub: `setActionsOpen(false)`). Plus `ActionsButton color="red"`: "Cancelar".
  (g) Content: `Block` with centered text "Notas vacías" in muted color.
  Import `getSession` from `../stores/authStore`.

- [x] T008 [US1] Update `src/App.jsx` — import `NotebookDetailPage` from
  `./pages/NotebookDetailPage`. Add wrapper:
  `function ProtectedDetail(props) { return <ProtectedRoute><NotebookDetailPage {...props} /></ProtectedRoute> }`.
  Add route `{ path: '/notebooks/:id', component: ProtectedDetail }` to the `routes`
  array **after** the `/notebooks/create` route (order matters: static routes must
  precede dynamic `:id` to avoid `create` being matched as an ID).

**Checkpoint**: Detail page opens with correct toolbar and placeholder. Edit/delete not
yet wired — expected at this stage.

---

## Phase 4: User Story 2 — Edit Notebook (Priority: P2)

**Goal**: Tapping "Editar" opens a bottom sheet pre-filled with all notebook fields.
Saving updates the toolbar immediately (optimistic). Failures show a toast and restore
original values.

**Independent Test**: Open detail → options → "Editar" → sheet opens pre-filled →
change title → save → toolbar updates immediately → error scenario: server down → title
reverts → toast shown.

### Implementation for User Story 2

- [x] T009 [P] [US2] Create `src/components/notebooks/EditNotebookSheet.jsx` — a
  controlled Sheet component with props `{ notebook, opened, onClose }`.
  Internal state: `title`, `description`, `color`, `iconName`, `selectedIds` (Set) —
  all initialized from `notebook` on mount via `useState`.
  Use `useEffect([notebook])` to reset fields when notebook prop changes.
  Renders an F7 `Sheet` (`opened={opened}` `onSheetClosed={onClose}` `style={{height:'85vh'}}`
  `swipeToClose`):
  Inside `PageContent`: `Navbar` with `title="Editar Cuaderno"` and a right "Guardar"
  button that calls `handleSave` (disabled while `isPending`).
  Form: `List` with `ListInput` for title (required) and description (optional textarea).
  Color swatches (same 8-color palette as `CreateNotebookPage.jsx`).
  `<IconSelector value={iconName} onChange={setIconName} />` from
  `../components/notebooks/IconSelector`.
  `<MemberPicker allUsers={allUsers} selectedIds={selectedIds} onChange={setSelectedIds}
  excludeId={notebook.owner} />` — `allUsers` from `useUsers()`.
  `handleSave`: validate title non-empty → call
  `mutate({ id: notebook.id, title, description, color, iconName, users: [...selectedIds] },
  { onSuccess: onClose, onError: (err) => f7.toast.create({text: err.message ?? 'Error al guardar', closeTimeout:3000, position:'top'}).open() })`.
  Use `useUpdateNotebook()` from `src/hooks/useUpdateNotebook.js`.

- [x] T010 [US2] Update `src/pages/NotebookDetailPage.jsx` — add `editSheetOpen` state
  (default false). Change "Editar" `ActionsButton` onClick to
  `setActionsOpen(false); setTimeout(() => setEditSheetOpen(true), 300)` (delay lets the
  Actions sheet close before Sheet opens). Add `<EditNotebookSheet notebook={notebook} opened={editSheetOpen} onClose={() => setEditSheetOpen(false)} />` at the bottom of the
  page. Import `EditNotebookSheet` from `../components/notebooks/EditNotebookSheet`.

**Checkpoint**: Edit flow is fully functional with optimistic updates and toast errors.

---

## Phase 5: User Story 3 — Delete Notebook (Priority: P3)

**Goal**: Tapping "Eliminar" (owner-only) opens a confirmation dialog with a 5-second
countdown. After countdown the confirm button enables; tapping it waits for server
confirmation before navigating back. Errors show a toast; the list is unchanged.

**Independent Test**: Own a notebook → open detail → options → "Eliminar" → dialog opens
→ confirm disabled for 5s → after countdown confirm enables → confirm → loading state →
server responds → navigate back → notebook gone from list.

### Implementation for User Story 3

- [x] T011 [P] [US3] Create `src/components/notebooks/DeleteConfirmDialog.jsx` — a
  controlled Dialog with props `{ notebook, opened, onClose, onConfirm, isDeleting }`.
  Internal state: `countdown` (number, starts at 5).
  On `opened` becoming true: start a `setInterval` that decrements countdown every 1000ms
  and clears at 0. Clear interval on component unmount or `opened` becoming false
  (reset countdown to 5 for next open).
  Renders an F7 `Dialog` (`opened={opened}` `onDialogClosed={() => { onClose(); /* reset */ }}`):
  title "Eliminar Cuaderno"; text `"¿Eliminar «${notebook?.title}»? Esta acción no se puede deshacer."`.
  Two buttons: `DialogButton onClick={onClose}`: "Cancelar".
  `DialogButton onClick={onConfirm} disabled={countdown > 0 || isDeleting} color="red"`:
  label is `countdown > 0 ? \`Espera ${countdown}s\` : isDeleting ? 'Eliminando...' : 'Eliminar'`.

- [x] T012 [US3] Update `src/pages/NotebookDetailPage.jsx` — add `deleteDialogOpen`
  state (default false). Change "Eliminar" `ActionsButton` onClick to
  `setActionsOpen(false); setTimeout(() => setDeleteDialogOpen(true), 300)`.
  Get `mutate: deleteMutate, isPending: isDeleting` from `useDeleteNotebook()`.
  Add `handleDeleteConfirm`: calls `deleteMutate(notebook.id, { onSuccess: () => f7router.back(), onError: () => { setDeleteDialogOpen(false); f7.toast.create({ text: 'Error al eliminar. Intenta de nuevo.', closeTimeout: 3000, position: 'top' }).open() } })`.
  Add `<DeleteConfirmDialog notebook={notebook} opened={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} onConfirm={handleDeleteConfirm} isDeleting={isDeleting} />`.
  Import `useDeleteNotebook` from `../hooks/useDeleteNotebook`,
  `DeleteConfirmDialog` from `../components/notebooks/DeleteConfirmDialog`.

**Checkpoint**: All three user stories independently functional and end-to-end tested.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T013 [P] Audit `src/pages/NotebookDetailPage.jsx` and `src/components/notebooks/EditNotebookSheet.jsx` — confirm no bare `fetch` calls (Principle V). Verify `useUpdateNotebook` optimistic update and rollback are wired (Principle VI). Verify `useDeleteNotebook` non-optimistic behavior is documented in code comment.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001 first; T002 after T001; T003+T004+T005 parallel after T002.
- **US1 (Phase 3)**: T006 + T007 parallel (different files, no deps); T008 after T007.
  Depends on Foundational (T003 needed by T007).
- **US2 (Phase 4)**: T009 after Foundational+US1; T010 after T009.
- **US3 (Phase 5)**: T011 parallel with T009 (different files); T012 after T011+T008.
- **Polish (Phase 6)**: After all stories complete.

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only.
- **US2 (P2)**: Depends on US1 (NotebookDetailPage must exist for T010 to update it).
- **US3 (P3)**: Depends on US1 (NotebookDetailPage must exist for T012 to update it).
  US2 and US3 are otherwise independent of each other.

### Parallel Opportunities

```bash
# Phase 2 parallel (after T002):
Task T003: Create src/hooks/useNotebook.js
Task T004: Create src/hooks/useUpdateNotebook.js
Task T005: Create src/hooks/useDeleteNotebook.js

# Phase 3 parallel:
Task T006: Update src/components/notebooks/NotebookCard.jsx
Task T007: Create src/pages/NotebookDetailPage.jsx

# Phase 4+5 parallel start (after T008):
Task T009: Create src/components/notebooks/EditNotebookSheet.jsx
Task T011: Create src/components/notebooks/DeleteConfirmDialog.jsx
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 2: Foundational (T001–T005)
2. Complete Phase 3: US1 (T006–T008)
3. **STOP and VALIDATE**: Tap notebook card → correct detail page → toolbar color/icon/title → options button → placeholder.
4. Proceed to US2 and US3 after MVP validated.

### Incremental Delivery

1. Foundational → API + hooks ready
2. US1 → Navigation + detail view (**MVP**)
3. US2 → Edit with optimistic updates
4. US3 → Delete with countdown + server confirmation
5. Polish → Compliance audit

---

## Notes

- `f7router.back()` is used for post-delete navigation (more reliable than `navigate('/')`)
- Route order in App.jsx: `/notebooks/create` MUST come before `/notebooks/:id`
- The 300ms delay before opening Sheet/Dialog after Actions close prevents visual overlap
- `countdown` reset to 5 each time `DeleteConfirmDialog` opens (prevents stale timer)
- Principle VI exception for delete is intentional and documented in plan.md Complexity Tracking
