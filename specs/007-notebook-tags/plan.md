# Implementation Plan: Notebook Tags Management

**Branch**: `007-notebook-tags` | **Date**: 2026-05-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/007-notebook-tags/spec.md`

## Summary

Add per-notebook tag management (title + icon) via a reusable `TagsPopup` Sheet component. Tags are configured locally on the Create Notebook form and sent with the creation payload; on the Edit Notebook form, each tag change is persisted immediately via dedicated backend endpoints. Tags are displayed as chip/badges on the Notebook Detail screen. All mutations follow the existing optimistic-UI-with-rollback pattern.

## Technical Context

**Language/Version**: JavaScript (React 19 + Vite 8)
**Primary Dependencies**: Framework7 9, TanStack React Query 5, framework7-react 9
**Storage**: Server state via TanStack Query cache; no local persistence
**Testing**: Manual (Constitution IX — no unit tests)
**Target Platform**: Mobile-first PWA (iOS Safari, Android Chrome)
**Project Type**: Mobile web application
**Performance Goals**: Tag popup opens in <150ms; mutations reflect optimistically in <16ms
**Constraints**: No third-party component libraries (Constitution IV); all UI via F7 or custom
**Scale/Scope**: ~10 tags per notebook typical; no hard frontend limit

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — `TagsPopup` is a bottom Sheet; `TagChip` row is horizontally scrollable. No desktop-specific layout.
- [x] **II. Minimalist Layout** — Tags popup shows a clean list + inline form; no competing focal points. Tag chips are compact pills below the notebook header.
- [x] **III. Framework7** — Sheet, Navbar, List, ListInput, Button, BlockTitle all used. No alternative UI library.
- [x] **IV. Custom Components** — `TagChip` and the inline tag form section are custom-built. `IconSelector` is reused (existing).
- [x] **V. TanStack Query** — `useAddTag`, `useUpdateTag`, `useDeleteTag` all use `useMutation`. No bare `fetch` in components.
- [x] **VI. Optimistic UI** — All three tag mutations implement optimistic array updates with rollback. Create-flow mutations are local-state only (no API until submit).
- [x] **VII. Cache Integrity** — `['notebook', id]` updated optimistically; `['notebooks']` marked stale on every tag mutation settle.
- [x] **VIII. Clean Code** — Single-responsibility hooks; descriptive names; no inline comments narrating obvious code.
- [x] **IX. No Unit Tests** — No test files created.
- [x] **X. Maintainability** — `TagsPopup` is the single reusable entry point (used in 2 places — below the 3-usage threshold but justified by the popup's significant complexity). `TagChip` is simple enough to not require abstraction beyond one component.

**No violations. Complexity Tracking table not required.**

## Project Structure

### Documentation (this feature)

```text
specs/007-notebook-tags/
├── plan.md              ← This file
├── spec.md
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── tags-api.md      ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── api/
│   ├── notebooks.js          (unchanged — tags sent in existing create/update payload)
│   └── tags.js               ← NEW: addTag, updateTag, deleteTag API calls
│
├── hooks/
│   ├── useCreateNotebook.js  MODIFIED: include tags in optimistic data
│   ├── useAddTag.js          ← NEW: POST tag with optimistic append + rollback
│   ├── useUpdateTag.js       ← NEW: PATCH tag with optimistic replace + rollback
│   └── useDeleteTag.js       ← NEW: DELETE tag with optimistic remove + rollback
│
├── components/notebooks/
│   ├── TagsPopup.jsx         ← NEW: Sheet; handles create-mode (local) + edit-mode (API)
│   ├── TagChip.jsx           ← NEW: read-only chip (icon + title pill)
│   └── EditNotebookSheet.jsx MODIFIED: add "Manage Tags" button + TagsPopup (edit mode)
│
└── pages/
    ├── CreateNotebookPage.jsx MODIFIED: tags state + "Manage Tags" button + TagsPopup (create mode)
    └── NotebookDetailPage.jsx MODIFIED: render TagChip row when notebook.tags non-empty
```

**Structure Decision**: Single-project frontend-only. Follows existing file layout convention — API calls in `src/api/`, mutations in `src/hooks/`, UI components in `src/components/notebooks/`, page-level changes in `src/pages/`.
