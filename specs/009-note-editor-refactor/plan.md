# Implementation Plan: Note Editor Refactor

**Branch**: `009-note-editor-refactor` | **Date**: 2026-05-04 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/009-note-editor-refactor/spec.md`

## Summary

Refactor note creation and editing from a bottom-sheet popup and inline-edit page into two dedicated full-screen routes, each centered on an MDXEditor markdown editor. The editor renders with a fixed bottom toolbar (bold, italic, underline, inline code, numbered list, checklist, insert image, undo, redo), a top header with tag selector and creation date, and debounced auto-save. The `title` API field carries raw markdown content; no backend changes are made in this feature.

## Technical Context

**Language/Version**: JavaScript / React 19.2.5  
**Primary Dependencies**: Framework7 9.0.3, TanStack Query 5.100.9, `@mdxeditor/editor` ~3.54.0 (new), Vite 8  
**Storage**: N/A — remote REST API via existing `src/api/client`  
**Testing**: None (per Constitution IX)  
**Target Platform**: Mobile-first PWA (iOS/Android via browser)  
**Project Type**: Mobile web app (PWA)  
**Performance Goals**: Editor load <1s; auto-save debounce ≤800ms  
**Constraints**: Mobile viewport; Framework7 design system; no backend field renames in this feature  
**Scale/Scope**: Single-user; per-notebook note list

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — Full-screen pages, fixed-bottom toolbar, mobile viewport first.
- [x] **II. Minimalist Layout** — Editor is the single focal point; header and footer zones are compact.
- [x] **III. Framework7** — App shell, Navbar, Actions, Sheet components all remain F7. MDXEditor is additive for the editor area only, not a Framework7 substitute.
- [⚠️] **IV. Custom Components** — MDXEditor is a third-party library. **VIOLATION** — see Complexity Tracking.
- [x] **V. TanStack Query** — All saves go through `useMutation` (`useCreateNote`, `useUpdateNote`, `useDeleteNote`). No bare `fetch` in components.
- [x] **VI. Optimistic UI** — Auto-save reuses `useUpdateNote` which already implements optimistic update + rollback.
- [x] **VII. Cache Integrity** — `useUpdateNote.onSettled` invalidates `['note', notebookId, noteId]`; list cache updated in-place.
- [x] **VIII. Clean Code** — Single-responsibility components; no inline narrative comments.
- [x] **IX. No Unit Tests** — No test files planned.
- [x] **X. Maintainability** — `NoteEditor` wrapper justified by 2 usages (create + edit); toolbar and header extracted only if shared.

## Project Structure

### Documentation (this feature)

```text
specs/009-note-editor-refactor/
├── plan.md              ← this file
├── spec.md
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── ui-contracts.md  ← Phase 1 output
└── tasks.md             ← /speckit-tasks output (not yet created)
```

### Source Code Changes

```text
src/
├── pages/
│   ├── CreateNoteEditorPage.jsx   [NEW] — /notebooks/:notebookId/notes/create
│   ├── NoteEditorPage.jsx         [NEW] — /notebooks/:notebookId/notes/:noteId
│   └── NoteDetailPage.jsx         [RETIRE] — replaced by NoteEditorPage
│
├── components/
│   └── notes/
│       ├── NoteEditor.jsx         [NEW] — MDXEditor wrapper (shared)
│       ├── NoteEditorHeader.jsx   [NEW] — tag selector + creation date (shared)
│       ├── CreateNotePopup.jsx    [RETIRE] — replaced by CreateNoteEditorPage
│       └── NoteCard.jsx           [MODIFY] — extract display title from markdown first line
│
├── styles/
│   └── note-editor.css            [NEW] — fixed-bottom toolbar override + editor layout
│
└── App.jsx                        [MODIFY] — add create route, replace NoteDetail route
```

**Structure Decision**: Single frontend project (no backend changes). New page files mirror the existing `src/pages/` convention. Shared editor component lives in `src/components/notes/` per existing note-component pattern.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| **IV — MDXEditor third-party library** | Spec explicitly requires MDXEditor for markdown editing with 9 specific toolbar actions (bold, italic, underline, inline code, numbered list, checklist, insert image, undo, redo). | Building a full markdown editor from scratch that matches Framework7's design language, handles contenteditable cross-browser, implements Lexical/ProseMirror-level undo/redo, and renders images inline would require months of work and is wholly disproportionate to the feature scope. The constitution's intent for Principle IV is to prevent pulling in full UI kits (Ant Design, MUI, etc.) as Framework7 substitutes — MDXEditor is a domain-specific tool with no Framework7 equivalent. |
