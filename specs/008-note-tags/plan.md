# Implementation Plan: Note Tags

**Branch**: `008-note-tags` | **Date**: 2026-05-03 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/008-note-tags/spec.md`

## Summary

Allow users to assign notebook-level tags to individual notes. Tags are selected via a `NoteTagPicker` sheet on the note creation form and note detail screen. Assigned tags are displayed as chips on note cards in the list and on the note detail screen. Backend already supports `tags: string[]` on all note endpoints — this is a pure frontend feature.

## Technical Context

**Language/Version**: JavaScript (React 19 + Vite 8)
**Primary Dependencies**: Framework7 9, TanStack React Query 5, framework7-react 9
**Storage**: Server state via TanStack Query cache; no local persistence
**Testing**: Manual (Constitution IX — no unit tests)
**Target Platform**: Mobile-first PWA (iOS Safari, Android Chrome)
**Project Type**: Mobile web application
**Performance Goals**: Picker opens in <150ms; tag chip resolution from cache is synchronous
**Constraints**: No third-party component libraries (Constitution IV); all UI via F7 or custom
**Scale/Scope**: ~20 tags per notebook; ~10 tags per note typical

## Constitution Check

- [x] **I. Mobile-First** — `NoteTagPicker` is a bottom Sheet. Tag chips display in a compact row, no desktop-specific layout.
- [x] **II. Minimalist Layout** — Picker is a clean checkbox list. Chips are compact and unobtrusive on note cards.
- [x] **III. Framework7** — Sheet, List, ListItem (checkbox), Button used. No alternative UI library.
- [x] **IV. Custom Components** — `NoteTagPicker` built from scratch. `TagChip` reused (already exists).
- [x] **V. TanStack Query** — `useUpdateNote` extended for tag mutations. No bare `fetch` in components.
- [x] **VI. Optimistic UI** — `useUpdateNote` already has optimistic update; extended to include `tags` field in the optimistic data patch.
- [x] **VII. Cache Integrity** — `['note', notebookId, noteId]` updated optimistically; `['notes', notebookId]` marked stale on settle.
- [x] **VIII. Clean Code** — Single-responsibility components; no comments narrating obvious code.
- [x] **IX. No Unit Tests** — No test files created.
- [x] **X. Maintainability** — `NoteTagPicker` used in 2 places (creation + detail) — below the 3-usage threshold but justified by significant shared rendering logic. Tag resolution is inlined (too simple to abstract).

**No violations. Complexity Tracking table not required.**

## Project Structure

### Documentation (this feature)

```text
specs/008-note-tags/
├── plan.md              ← This file
├── spec.md
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── notes-api.md     ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── components/notes/
│   ├── NoteTagPicker.jsx     ← NEW: Sheet picker; checkbox list of notebook tags
│   ├── NoteCard.jsx          MODIFIED: render tag chips row from cache-resolved tags
│   └── CreateNotePopup.jsx   MODIFIED: selectedTagIds state + NoteTagPicker + pass tags to create
│
├── hooks/
│   └── useUpdateNote.js      MODIFIED: accept optional tags field; include in optimistic update
│
└── pages/
    └── NoteDetailPage.jsx    MODIFIED: tags section (chips + "Gestionar etiquetas" button + NoteTagPicker)
```

**Structure Decision**: Single-project frontend. Follows existing file layout — new components in `src/components/notes/`, hook extension in `src/hooks/`, page changes in `src/pages/`.
