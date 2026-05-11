# Implementation Plan: Edit Transaction

**Branch**: `013-edit-transaction` | **Date**: 2026-05-10 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `specs/013-edit-transaction/spec.md`

## Summary

Add the ability for users to edit existing transactions by tapping a transaction card. A new bottom-sheet component (`TransactionEditSheet`) opens pre-filled with the current transaction data. Every field change is reflected immediately via optimistic UI and auto-saved to the server after a 300ms debounce. A `SaveStatusIndicator` in the sheet header shows the real-time save state. No save button exists. A new `updateTransaction` API function and `useUpdateTransaction` mutation hook are added to support the write operation with full optimistic update and cache rollback.

## Technical Context

**Language/Version**: JavaScript — React 19.2.5
**Primary Dependencies**: Framework7 9.0.3 (Sheet, PageContent, ListInput); TanStack Query 5.100.9 (useMutation, optimistic update); Lucide React (icons)
**Storage**: N/A — server API via existing HTTP client (`patch` from `src/api/client.js`)
**Testing**: Manual (Constitution IX)
**Target Platform**: Mobile-first PWA
**Project Type**: Mobile web application (PWA)
**Performance Goals**: Field changes reflected instantly (optimistic); debounced server save within 300ms of last keystroke; full round-trip within 2 seconds
**Constraints**: CSS Modules; Framework7 UI primitives; Lucide React icons; pnpm; data-testid on all interactive elements; no unit tests
**Scale/Scope**: Per-transaction edits; reuses existing TagSelectionSheet, SaveStatusIndicator, and date picker patterns

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — Edit sheet is a bottom sheet, matching existing mobile transaction UX.
- [x] **II. Minimalist Layout** — Single-purpose sheet with inline fields; no competing focal points.
- [x] **III. Framework7** — Sheet, PageContent, ListInput are all native F7 primitives.
- [x] **IV. Custom Components** — `TransactionEditSheet` built from scratch; no third-party substitutes.
- [x] **V. TanStack Query** — All persistence goes through `useUpdateTransaction` → `useMutation`; no bare `fetch`.
- [x] **VI. Optimistic UI** — `onMutate` patches cache immediately; `onError` rolls back to previous snapshot.
- [x] **VII. Cache Integrity** — `onSettled` calls `invalidateQueries(['transactions', notebookId])` to sync server state.
- [x] **VIII. Clean Code** — Debounce logic isolated in refs; save-status transitions are explicit state machine.
- [x] **IX. No Unit Tests** — None planned.
- [x] **X. Maintainability** — Mirrors `useUpdateNote` and `NoteEditorPage` patterns exactly; zero onboarding friction.
- [x] **XI. CSS Modules** — All styles in `TransactionEditSheet.module.css`; no static inline styles.
- [x] **XII. Lucide React Icons** — All icons (ChevronLeft, Calendar, ChevronRight) from Lucide.
- [x] **XIII. pnpm** — No new packages; all dependencies already installed.
- [x] **XIV. data-testid** — All interactive elements (amount input, type toggle, date picker, description, tags row) receive `data-testid`.

## Project Structure

### Documentation (this feature)

```text
specs/013-edit-transaction/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── contracts/
│   └── api-contracts.md ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code

```text
src/
├── api/
│   └── transactions.js              ← ADD updateTransaction(notebookId, id, payload)
├── hooks/
│   └── useUpdateTransaction.js      ← NEW — mirrors useUpdateNote pattern
├── components/transactions/
│   ├── TransactionEditSheet.jsx     ← NEW — debounced auto-save edit form
│   └── TransactionEditSheet.module.css  ← NEW
└── pages/
    └── NotebookTransactionsPage.jsx ← UPDATE — editingTransaction state + sheet wiring
```

**Structure Decision**: A dedicated `TransactionEditSheet` is preferred over extending `TransactionFormSheet` because the create and edit forms differ fundamentally in flow (create is 2-step: tag-selection → form; edit is a direct single-step sheet), button presence (edit has none), and save mechanism (debounced auto-save vs. explicit submit). Keeping them separate preserves single-responsibility and avoids branching logic in the existing create form.
