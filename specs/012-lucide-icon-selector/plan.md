# Implementation Plan: Improved Icon Selector with Spanish Search

**Branch**: `012-lucide-icon-selector` | **Date**: 2026-05-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/012-lucide-icon-selector/spec.md`

## Summary

Replace the existing Framework7-icon-based `IconSelector` component with a fully generic, reusable picker that sources icons from the Lucide React library. A curated Spanish-to-English keyword map enables Spanish-speaking users to search by meaning (e.g., "comida" → food icons) with a partial-name fuzzy fallback for unmapped terms. The component keeps its existing `{ value, onChange }` prop interface so all four current callers require no changes beyond updating their import path.

## Technical Context

**Language/Version**: JavaScript — React 19.2.5
**Primary Dependencies**: Framework7 9.0.3 (UI primitives: Sheet, Searchbar, Block, PageContent); Lucide React (to install — latest stable); TanStack Query 5.100.9 (existing hooks handle persistence, no new queries needed)
**Storage**: N/A — the selected icon name (string) is already a field on notebook/category/transaction entities, persisted through existing TanStack Query mutation hooks
**Testing**: Manual (per Constitution IX)
**Target Platform**: Mobile-first PWA (iOS and Android browsers primary; desktop secondary)
**Project Type**: Mobile web application (PWA)
**Performance Goals**: Search results visible within 300ms of the user stopping typing (250ms debounce); default set renders instantly on sheet open
**Constraints**: CSS Modules for all static styling; Framework7 for all UI primitives; Lucide React as icon asset source only; no unit tests; no inline `style={{}}` for static values
**Scale/Scope**: ~1500 Lucide icons in registry; 4 existing callers (CreateNotebookPage, EditNotebookPage, EditNotebookSheet, TagsPopup); curated Spanish map covers 15+ high-frequency categories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — Sheet modal (70vh) is the established mobile-first pattern from the current selector; grid layout scales to desktop.
- [x] **II. Minimalist Layout** — Single-purpose picker: search bar on top, icon grid below. No competing focal points.
- [x] **III. Framework7** — Sheet, PageContent, Searchbar, Block are all native Framework7 primitives. Lucide React provides SVG assets only.
- [x] **IV. Custom Components** — Lucide React is used as an SVG icon asset library (analogous to `framework7-icons`), not as a UI component substitute. No UI framework other than Framework7 is introduced.
- [x] **V. TanStack Query** — No bare `fetch` calls. Icon selection is client-side state only; parent mutations (useCreateNotebook, useUpdateNotebook, etc.) already handle server persistence.
- [x] **VI. Optimistic UI** — No new mutations; existing hooks carry optimistic updates.
- [x] **VII. Cache Integrity** — No new queries; existing cache invalidation patterns unchanged.
- [x] **VIII. Clean Code** — Component split into focused files: registry, map, component, styles. Single-responsibility functions for search and normalisation.
- [x] **IX. No Unit Tests** — None planned.
- [x] **X. Maintainability** — Moves from `components/notebooks/` to `components/IconSelector/` to reflect generic scope. Existing callers update import path only.
- [x] **XI. CSS Modules** — All styles in `IconSelector.module.css`. Dynamic theme colour on trigger remains as `style={{}}` (runtime value from CSS variable — permitted exception).

## Project Structure

### Documentation (this feature)

```text
specs/012-lucide-icon-selector/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── ui-contracts.md  ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code

```text
src/
├── components/
│   ├── IconSelector/                    ← NEW (generic, replaces notebooks/IconSelector)
│   │   ├── IconSelector.jsx             ← Main picker component
│   │   ├── IconSelector.module.css      ← All styles
│   │   ├── lucideIcons.js               ← Static registry: [{name, Icon}] for all Lucide icons
│   │   └── spanishIconMap.js            ← {spanishWord: [LucideIconName, ...]} lookup
│   └── notebooks/
│       ├── IconSelector.jsx             ← REMOVED (replaced by generic)
│       ├── IconSelector.module.css      ← REMOVED
│       └── f7Icons.js                   ← REMOVED (no longer needed)
├── pages/
│   ├── CreateNotebookPage.jsx           ← Update import path only
│   └── EditNotebookPage.jsx             ← Update import path only
└── components/notebooks/
    ├── EditNotebookSheet.jsx            ← Update import path only
    └── TagsPopup.jsx                    ← Update import path only
```

**Structure Decision**: Single `src/components/IconSelector/` folder following the existing per-component folder pattern. The component graduates from `notebooks/` subdirectory to the top level of `components/` because it is now a generic utility used by any entity type.
