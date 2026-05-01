# Implementation Plan: Notebook Detail View

**Branch**: `003-notebook-detail` | **Date**: 2026-04-29 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/003-notebook-detail/spec.md`

## Summary

Add a detail page at `/notebooks/:id` that shows a color-tinted toolbar with the
notebook's icon and title, an options menu for edit and delete actions, and a "Notas
vacías" placeholder. Edit is optimistic (immediate feedback + rollback on error). Delete
is non-optimistic by design: a 5-second countdown gates the confirmation, the app waits
for server confirmation, and navigates back only on success.

## Technical Context

**Language/Version**: JavaScript (ES2022) / React 19
**Primary Dependencies**: Framework7 9.x (UI), TanStack Query v5 (server state)
**Storage**: TanStack Query cache `['notebooks']` — no `GET /api/v1/notebooks/:id` exists;
  notebook is resolved by ID from the list cache
**Testing**: Manual (no unit tests — Principle IX)
**Target Platform**: Mobile browsers (iOS Safari, Android Chrome)
**Project Type**: Mobile web app (SPA)
**Performance Goals**: Detail page render < 500ms (data from cache); edit optimistic
  response < 100ms; delete navigation < 500ms after server success
**Constraints**: Framework7-only UI; TanStack Query for all server state; edit MUST be
  optimistic with rollback; delete MUST be non-optimistic (explicit spec requirement);
  no third-party component libraries
**Scale/Scope**: 1 new page; 3 new custom components; 3 new hooks; 2 API additions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — Color-tinted Navbar, bottom Sheet for edit form, F7 Actions
      sheet for options menu — all mobile-optimised patterns.
- [x] **II. Minimalist Layout** — Toolbar: back + icon + title + options button (4 items
      max). Content: single "Notas vacías" placeholder. No visual clutter.
- [x] **III. Framework7** — Navbar, Actions, Sheet, Dialog — all native F7 primitives.
      No external UI library.
- [x] **IV. Custom Components** — `EditNotebookSheet`, `DeleteConfirmDialog` (with
      countdown) built from scratch; reuse `ColorPicker` (inline swatches), `IconSelector`,
      `MemberPicker` from feature 002.
- [x] **V. TanStack Query** — `useNotebook` (useQuery select), `useUpdateNotebook`
      (useMutation), `useDeleteNotebook` (useMutation). No bare fetch in components.
- [ ] **VI. Optimistic UI** — Edit mutation IS optimistic (rollback on error). Delete
      mutation is intentionally non-optimistic per spec. Exception documented below.
- [x] **VII. Cache Integrity** — Edit: `onSettled` invalidates `['notebooks']`.
      Delete: `onSuccess` invalidates `['notebooks']` then navigates back.
- [x] **VIII. Clean Code** — Single-responsibility modules per hook/component/api.
- [x] **IX. No Unit Tests** — No test files planned.
- [x] **X. Maintainability** — New files extend the existing `src/components/notebooks/`
      and `src/hooks/` structure.

## Project Structure

### Documentation (this feature)

```text
specs/003-notebook-detail/
├── plan.md                         # This file
├── research.md                     # Phase 0 output
├── data-model.md                   # Phase 1 output
├── quickstart.md                   # Phase 1 output
├── contracts/
│   └── backend-notebooks-api.md   # Phase 1 output (update + delete endpoints)
└── tasks.md                        # /speckit-tasks output
```

### Source Code

```text
src/
├── api/
│   ├── client.js                  ← UPDATE: add patch(), del() HTTP helpers
│   └── notebooks.js               ← UPDATE: add updateNotebook(id, payload),
│                                            deleteNotebook(id)
├── hooks/
│   ├── useNotebook.js             ← NEW: useQuery(['notebooks']) + select by id
│   ├── useUpdateNotebook.js       ← NEW: useMutation + optimistic edit + rollback
│   └── useDeleteNotebook.js       ← NEW: useMutation (non-optimistic) + invalidate
├── pages/
│   └── NotebookDetailPage.jsx     ← NEW: color-tinted Navbar, options Actions,
│                                          "Notas vacías" placeholder
├── components/
│   └── notebooks/
│       ├── NotebookCard.jsx        ← UPDATE: add href="/notebooks/:id" for navigation
│       ├── EditNotebookSheet.jsx   ← NEW: F7 Sheet with pre-filled edit form
│       └── DeleteConfirmDialog.jsx ← NEW: F7 Dialog + 5-second countdown
└── App.jsx                         ← UPDATE: add /notebooks/:id protected route
```

**Structure Decision**: Detail page follows the same protected-route pattern as
`/notebooks/create`. Edit and delete components live in `src/components/notebooks/`
alongside the existing card and picker components.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle VI (Optimistic UI) — delete is non-optimistic | Deletion is irreversible. The spec explicitly requires a 5-second countdown AND server-confirmed navigation to prevent data loss. An optimistic delete followed by a failure rollback would be jarring and confusing for a destructive action. | Optimistic delete + rollback was considered but rejected by the product owner: the 5-second countdown already slows the flow intentionally, so the additional latency of waiting for server confirmation is acceptable and safer. |
