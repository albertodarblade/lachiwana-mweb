# Implementation Plan: Notebooks UI

**Branch**: `002-notebooks-ui` | **Date**: 2026-04-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-notebooks-ui/spec.md`

## Summary

Replace the existing health-check home page with a full Notebooks home page. The page
shows a "Lachiwana" navbar with the logged-in user's avatar on the right, a list of the
user's notebooks (owned + member), an empty-state placeholder when no notebooks exist,
and a FAB "Crear Cuaderno" that navigates to a dedicated creation form. The creation
form collects title (required), description, a color palette picker, an icon grid picker,
and a searchable multi-user member picker. Notebook creation uses optimistic UI to show
the new entry instantly before server confirmation.

## Technical Context

**Language/Version**: JavaScript (ES2022) / React 19
**Primary Dependencies**: Framework7 9.x (UI), TanStack Query v5 (server state), Vite 8
**Storage**: localStorage (existing AuthSession — read for user display in navbar)
**Testing**: Manual (no unit tests — Principle IX)
**Target Platform**: Mobile browsers (iOS Safari, Android Chrome)
**Project Type**: Mobile web app (SPA)
**Performance Goals**: Notebooks list render < 2 s; optimistic entry visible < 100 ms
**Constraints**: Framework7-only UI; TanStack Query for all server state; optimistic
  mutation with rollback required; no third-party component libraries
**Scale/Scope**: ~2 new pages; 3 new custom components; 2 new API hooks

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — All layouts designed for mobile viewport; FAB is the
      standard mobile pattern for primary creation actions.
- [x] **II. Minimalist Layout** — Navbar has 2 elements (title + avatar); cards show
      3 pieces of info (title + color + icon). No decorative clutter.
- [x] **III. Framework7** — Navbar, Page, Fab, List, Sheet, Searchbar, Card — all
      native F7 primitives. No external UI library.
- [x] **IV. Custom Components** — NotebookCard, MemberPicker (searchable multi-select),
      color palette picker, icon grid picker — all built from scratch to F7 standards.
- [x] **V. TanStack Query** — `useNotebooks` (useQuery), `useCreateNotebook`
      (useMutation). No bare fetch in components.
- [x] **VI. Optimistic UI** — `useCreateNotebook` adds an optimistic entry to the
      notebooks cache on `onMutate`, rolls back on `onError`, and invalidates on
      `onSettled`. Rollback logic is mandatory.
- [x] **VII. Cache Integrity** — `onSettled` in the create mutation calls
      `queryClient.invalidateQueries({ queryKey: ['notebooks'] })` to sync with server.
- [x] **VIII. Clean Code** — Single-responsibility modules per component/hook/api file.
- [x] **IX. No Unit Tests** — No test files planned.
- [x] **X. Maintainability** — New files under `src/components/notebooks/` sub-folder;
      follows existing flat `src/` conventions.

## Project Structure

### Documentation (this feature)

```text
specs/002-notebooks-ui/
├── plan.md                          # This file
├── research.md                      # Phase 0 output
├── data-model.md                    # Phase 1 output
├── quickstart.md                    # Phase 1 output
├── contracts/
│   └── backend-notebooks-api.md    # Phase 1 output
└── tasks.md                         # /speckit-tasks output
```

### Source Code

```text
src/
├── api/
│   └── notebooks.js               ← NEW: fetchNotebooks, createNotebook
├── hooks/
│   ├── useNotebooks.js             ← NEW: useQuery(['notebooks'], fetchNotebooks)
│   └── useCreateNotebook.js       ← NEW: useMutation + optimistic update + rollback
├── pages/
│   ├── NotebooksPage.jsx           ← NEW: main home (replaces HomePage)
│   └── CreateNotebookPage.jsx     ← NEW: creation form
├── components/
│   └── notebooks/
│       ├── NotebookCard.jsx         ← NEW: card — title + color indicator + icon
│       ├── NotebookEmptyState.jsx   ← NEW: empty-state block
│       └── MemberPicker.jsx         ← NEW: F7 Sheet + Searchbar + checkbox list
└── App.jsx                          ← UPDATE: swap / to NotebooksPage;
                                              add /notebooks/create route
```

**Deleted**: `src/pages/HomePage.jsx` — replaced entirely by `NotebooksPage.jsx`.

**Structure Decision**: New `src/components/notebooks/` sub-directory groups all
notebook-specific components. Cross-feature components stay at `src/components/` root.

## Complexity Tracking

> No constitution violations. No entries required.
