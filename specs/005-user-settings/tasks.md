# Tasks: User Settings Page

**Input**: Design documents from `/specs/005-user-settings/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, quickstart.md ✓

**Tests**: No test tasks — Principle IX (no unit tests).

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on each other)
- **[Story]**: Which user story this task belongs to (US1–US4)
- All file paths are relative to repository root

---

## Phase 1: Setup (Foundational Store)

**Purpose**: Create the settings store — required by ALL user stories and by the no-flash
initialization in `main.jsx`.

**⚠️ CRITICAL**: All subsequent phases depend on this store.

- [x] T001 Create src/stores/settingsStore.js — implement three named exports:
  `getPrefs(userId)` reads `localStorage.getItem('lachiwana_prefs_${userId}')`, parses
  JSON, and returns the result or `{ theme: 'ios', colorScheme: 'light' }` if missing/
  invalid; `setPrefs(userId, prefs)` JSON-serializes and writes the key then calls
  `applyPrefs(prefs)`; `applyPrefs(prefs)` mutates `document.documentElement.classList`:
  removes `ios`/`md` then adds `prefs.theme`, and adds `theme-dark` when
  `prefs.colorScheme === 'dark'` or removes it otherwise; wrap all localStorage calls in
  try/catch so storage errors are silently swallowed

**Checkpoint**: settingsStore ready — all other tasks can now proceed.

---

## Phase 2: Foundational (App Initialization & Routing)

**Purpose**: Wire the store into the app entry point for no-flash loading, make
`f7params.theme` dynamic, add the `/settings` route, and build the reusable profile
header component. All three tasks touch different files and can run in parallel after T001.

**⚠️ CRITICAL**: Phases 3–6 depend on T003 (route) and T004 (component).

- [x] T002 [P] Update src/main.jsx — before `ReactDOM.createRoot().render()`, import
  `{ getSession }` from `./stores/authStore` and `{ getPrefs, applyPrefs }` from
  `./stores/settingsStore`; call
  `applyPrefs(getPrefs(getSession()?.user?.googleId ?? ''))` so saved CSS classes are
  applied synchronously before the first React paint; no visible change when no session
  exists (defaults already match F7's initial class state)

- [x] T003 [P] Update src/App.jsx — import `SettingsPage` from `./pages/SettingsPage`
  and `{ getSession }` from `./stores/authStore` and `{ getPrefs }` from
  `./stores/settingsStore`; replace the hardcoded `theme: 'ios'` in `f7params` with
  `theme: getPrefs(getSession()?.user?.googleId ?? '').theme` so F7 initializes with the
  user's saved theme; add a `ProtectedSettingsPage` wrapper function identical to
  existing `ProtectedDetail` etc.; add `{ path: '/settings', component:
  ProtectedSettingsPage }` to the `routes` array before the notebook routes

- [x] T004 [P] Create src/components/settings/UserProfileHeader.jsx — reads
  `getSession().user` for `name`, `email`, `picture`; renders a centered block: circular
  photo `<img>` (64px diameter) with `onError` fallback to an F7 `<i
  className="f7-icons">person_circle</i>` icon at the same size; user's full `name` in
  bold below the photo; `email` in smaller muted text below the name; no interactive
  controls (display-only component)

**Checkpoint**: App wired for no-flash loading, route registered, header component ready.

---

## Phase 3: User Story 1 — View Profile Information (Priority: P1) 🎯 MVP

**Goal**: User taps their avatar on the notebooks list and lands on `/settings` showing
their full name, email, and profile photo.

**Independent Test**: Navigate to `/settings` → name, email, profile photo all visible
within 1 second; broken photo URL shows fallback avatar.

### Implementation for User Story 1

- [x] T005 [US1] Create src/pages/SettingsPage.jsx — F7 `Page` with `Navbar` (title
  "Ajustes", back link "Atrás"); render `<UserProfileHeader />` at the top of the page
  content; include placeholder `<List>` sections for logout (US2), theme (US3), and
  color scheme (US4) to be filled in subsequent phases; import
  `UserProfileHeader` from `../components/settings/UserProfileHeader` (depends on T003,
  T004)

- [x] T006 [US1] Update src/pages/NotebooksPage.jsx — wrap the existing `<UserAvatar />`
  render in a `<div>` with `onClick={() => navigate('/settings')}` and
  `style={{ cursor: 'pointer' }}`; import `{ navigate }` from `../utils/f7navigate` if
  not already imported; the `UserAvatar` component itself remains unchanged

**Checkpoint**: US1 complete — avatar tap opens settings, profile data visible.

---

## Phase 4: User Story 2 — Logout with Confirmation (Priority: P2)

**Goal**: "Cerrar sesión" button on the settings page shows a confirm/cancel dialog;
confirming ends the session and redirects to login.

**Independent Test**: Tap logout → dialog appears → cancel → still on settings →
tap logout → confirm → redirected to `/login` → back-navigation to protected page
redirects back to login.

### Implementation for User Story 2

- [x] T007 [US2] Update src/pages/SettingsPage.jsx — import `{ f7 }` from
  `framework7-react`, `{ clearSession }` from `../stores/authStore`, and `queryClient`
  from `../queryClient`; in the logout placeholder section add an F7 `List` with a
  single red `ListItem` titled "Cerrar sesión"; its `onClick` calls
  `f7.dialog.confirm('¿Cerrar sesión?', 'Cerrar sesión', () => { clearSession();
  queryClient.clear(); window.location.replace('/login') })` — the confirm callback
  performs all three steps in order; no loading state needed (redirect is immediate)

**Checkpoint**: US2 complete — logout flow works with confirmation dialog.

---

## Phase 5: User Story 3 — Theme Selection (Priority: P3)

**Goal**: User selects iOS or Google (MD) theme; change is applied immediately across
the app and persists across sessions.

**Independent Test**: Select Google theme → UI updates immediately → hard-reload →
Google theme still active; second user logs in → sees default iOS theme.

### Implementation for User Story 3

- [x] T008 [US3] Update src/pages/SettingsPage.jsx — import `{ getPrefs, setPrefs }` from
  `../stores/settingsStore` and `{ getSession }` from `../stores/authStore`; derive
  `userId = getSession()?.user?.googleId ?? ''` and `currentPrefs = getPrefs(userId)` at
  component scope (recalculate on each render so changes are reflected); in the theme
  placeholder section render a `BlockTitle` ("Estilo") and a `List` with two `ListItem`
  rows: "iOS" and "Google"; each row shows a checkmark icon when it matches
  `currentPrefs.theme`; `onClick` of each row calls
  `setPrefs(userId, { ...currentPrefs, theme: 'ios' | 'md' })` and then forces a
  re-render via `useState` counter or `useReducer` so the checkmarks update immediately

**Checkpoint**: US3 complete — theme switches immediately and persists.

---

## Phase 6: User Story 4 — Dark / Light Mode (Priority: P4)

**Goal**: User toggles between dark and light color scheme; change is applied immediately
and persists.

**Independent Test**: Enable dark mode → app background darkens immediately → hard-reload
→ dark mode still active with no flash of light mode.

### Implementation for User Story 4

- [x] T009 [US4] Update src/pages/SettingsPage.jsx — in the color-scheme placeholder
  section render a `BlockTitle` ("Apariencia") and a `List` with a `ListItem` that has a
  F7 `Toggle` on the right slot; toggle label: "Modo oscuro"; `checked` state is
  `currentPrefs.colorScheme === 'dark'`; `onToggleChange` calls
  `setPrefs(userId, { ...currentPrefs, colorScheme: checked ? 'dark' : 'light' })`; the
  toggle state updates immediately because `setPrefs` calls `applyPrefs` which mutates
  the DOM class synchronously before the next render

**Checkpoint**: US4 complete — dark/light mode switches immediately and persists.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Defensive verification and end-to-end validation.

- [x] T010 [P] Verify no-flash initialization in src/main.jsx — set dark mode + MD
  theme in the app, then hard-reload (`Ctrl+Shift+R`); confirm there is no visible
  flash of iOS + light styling before the correct classes are applied; if a flash is
  observed, check that the `applyPrefs` call in `main.jsx` is BEFORE
  `ReactDOM.createRoot().render()` and that `getPrefs` returns the correct saved value

- [x] T011 Run quickstart.md validation scenarios end-to-end — US1 through US4 in order,
  including cross-user isolation (SC-004) and the no-flash check (SC-003)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T001 (settingsStore). T002, T003, T004 can run
  in parallel with each other after T001
- **US1 (Phase 3)**: Depends on T003 (route) and T004 (component). T005 and T006 can
  run in parallel
- **US2 (Phase 4)**: Depends on T005 (SettingsPage exists)
- **US3 (Phase 5)**: Depends on T007 (SettingsPage updated for US2)
- **US4 (Phase 6)**: Depends on T008 (SettingsPage updated for US3)
- **Polish (Phase 7)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: Foundational phase complete — no story dependencies
- **US2 (P2)**: US1 complete (SettingsPage must exist)
- **US3 (P3)**: US2 complete (sequential updates to same file)
- **US4 (P4)**: US3 complete (sequential updates to same file)

### Within Each User Story

- US1: T004 [P] → T005 → T006 (T005 and T006 can run in parallel after T004)
- US2–US4: All single-task phases — no internal parallelism

### Parallel Opportunities

- **Phase 2**: T002, T003, T004 fully parallel after T001
- **Phase 3**: T005 and T006 parallel after T004

---

## Parallel Example: Foundational Phase

```bash
# After T001 completes, launch all three in parallel:
Task T002: Update src/main.jsx — pre-render applyPrefs call
Task T003: Update src/App.jsx — dynamic theme + /settings route
Task T004: Create src/components/settings/UserProfileHeader.jsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: settingsStore.js (CRITICAL)
2. Complete Phase 2: main.jsx + App.jsx + UserProfileHeader (parallel)
3. Complete Phase 3: SettingsPage (basic) + NotebooksPage avatar tap
4. **STOP and VALIDATE**: Tap avatar → /settings opens → profile info visible
5. Demo or deploy MVP

### Incremental Delivery

1. Phase 1 + Phase 2 → infrastructure ready
2. Phase 3 (US1) → Settings reachable, profile visible — demo
3. Phase 4 (US2) → Logout with confirmation — demo
4. Phase 5 (US3) → Theme switching — demo
5. Phase 6 (US4) → Dark mode — demo
6. Phase 7 → No-flash verification + full quickstart validation

---

## Notes

- `[P]` tasks = different files, no dependencies on each other
- No test tasks — Principle IX confirmed in plan.md
- US3 and US4 both update `SettingsPage.jsx` sequentially — they cannot be parallelized
- `settingsStore.applyPrefs()` mutates `document.documentElement.classList` directly;
  this is the canonical F7 runtime theming mechanism (see research.md)
- `setPrefs()` always calls `applyPrefs()` internally — callers never call `applyPrefs`
  directly except in `main.jsx` (where no `userId` is needed for the write path)
- No TanStack Query is used in this feature — all data is session-local and synchronous
- Force re-render after `setPrefs()` in US3/US4 via a local `useState` counter since
  `settingsStore` is not reactive (it's a plain module, not React state)
