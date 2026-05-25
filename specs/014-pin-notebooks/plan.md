# Implementation Plan: Pin Notebooks

**Branch**: `014-pin-notebooks` | **Date**: 2026-05-25 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/014-pin-notebooks/spec.md`

## Summary

Allow users to pin any notebook from the notebooks list. Pinned notebooks appear at the top of the list under a "Pinned" section label, sorted by most-recently-pinned first. Unpinned notebooks appear below under an "All" label (shown only when at least one notebook is pinned). Pin state is stored in localStorage per user (`lachiwana_pins_{googleId}`), persists across reloads, and survives logout. The implementation is entirely client-side — no backend changes.

## Technical Context

**Language/Version**: JavaScript (React 18, JSX)  
**Primary Dependencies**: Framework7-React, TanStack Query v5, Lucide React, CSS Modules  
**Storage**: localStorage — client-side only; no backend mutations  
**Testing**: None (Constitution IX — no unit tests)  
**Target Platform**: Mobile-first web app (iOS/Android browser, Framework7)  
**Project Type**: Mobile web application  
**Performance Goals**: Pin/unpin reorders list synchronously — zero perceived latency (localStorage write is synchronous)  
**Constraints**: Client-side only; per-user isolation via `googleId`; no new npm packages required  
**Scale/Scope**: Single user's notebook collection (typically < 100 notebooks); no pagination concerns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — Pin icon button and section labels are designed for compact mobile card layout; no desktop-specific layout added.
- [x] **II. Minimalist Layout** — Pin button is a small icon overlay on the card; section labels ("Pinned" / "All") are minimal inline dividers with no visual clutter.
- [x] **III. Framework7** — `NotebooksPage` list uses F7 page/block structure; no new UI library introduced.
- [x] **IV. Custom Components** — `pinStore.js` and `usePinnedNotebooks.js` are built from scratch following existing store/hook patterns; no third-party library added.
- [x] **V. TanStack Query** — Notebooks continue to be fetched via `useQuery`. Pin state is localStorage-only (client state, not server state) — no `useMutation` needed; no bare `fetch` introduced.
- [x] **VI. Optimistic UI** — Not applicable: pin/unpin is a synchronous localStorage write with no network round-trip. The UI update is instantaneous by definition.
- [x] **VII. Cache Integrity** — No server data is mutated; the notebooks query cache is untouched by pin operations.
- [x] **VIII. Clean Code** — `pinStore.js` has single-responsibility functions; `usePinnedNotebooks` hook isolates all pin state logic from the page component.
- [x] **IX. No Unit Tests** — No test files planned or created.
- [x] **X. Maintainability** — Module boundaries: store → hook → component. No abstractions introduced with fewer than 3 usages.
- [x] **XI. CSS Modules** — Pin button and section label styles go in `NotebookCard.module.css` and `NotebooksPage.module.css` respectively; no `style={{}}` for static values.
- [x] **XII. Lucide React Icons** — Pin icon uses `<Pin />` and `<PinOff />` from `lucide-react` (confirmed available); no `f7-icons` font used.
- [x] **XIII. pnpm** — No new packages; all commands use `pnpm`.
- [x] **XIV. data-testid** — Pin button on `NotebookCard` gets `data-testid="notebook-card-pin-{notebookId}"`.

**All gates pass. No violations.**

## Project Structure

### Documentation (this feature)

```text
specs/014-pin-notebooks/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── stores/
│   ├── authStore.js            (existing — provides getSession / googleId)
│   ├── settingsStore.js        (existing — reference pattern for pinStore)
│   └── pinStore.js             (NEW — localStorage CRUD for pin state)
├── hooks/
│   └── usePinnedNotebooks.js   (NEW — React state wrapper for pinStore)
├── components/
│   └── notebooks/
│       ├── NotebookCard.jsx        (MODIFIED — add pin icon button)
│       └── NotebookCard.module.css (MODIFIED — add pin button styles)
└── pages/
    ├── NotebooksPage.jsx           (MODIFIED — sort pinned first, add section labels)
    └── NotebooksPage.module.css    (MODIFIED — add section label styles)
```

**Structure Decision**: Single-project web application. New files follow the existing `stores/` and `hooks/` conventions. No new directories needed.

## Complexity Tracking

> No constitution violations — table not required.
