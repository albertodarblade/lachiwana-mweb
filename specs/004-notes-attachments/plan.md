# Implementation Plan: Notes & Attachments

**Branch**: `004-notes-attachments` | **Date**: 2026-05-02 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/004-notes-attachments/spec.md`

## Summary

Add a full notes system nested within notebooks. The notebook detail page replaces its
static placeholder with a live notes list and a FAB. Notes have their own dedicated
routes (`/notebooks/:id/notes/create`, `/notebooks/:id/notes/:noteId`). Note titles
auto-save with a 800ms debounce on every keystroke. Attachments are fetched with the
authenticated API layer and rendered as data URLs (since the file endpoint requires a
Bearer token that `<img src>` cannot send). Images show as thumbnails with F7's
PhotoBrowser for fullscreen view; non-image files show a file placeholder with a
download button. Note deletion uses the same 5-second countdown pattern as notebook
deletion.

## Technical Context

**Language/Version**: JavaScript (ES2022) / React 19
**Primary Dependencies**: Framework7 9.x (UI + PhotoBrowser), TanStack Query v5
**Storage**: TanStack Query cache — query keys `['notes', notebookId]`,
  `['note', notebookId, noteId]`, `['file', fileSrcId]`
**Testing**: Manual (no unit tests — Principle IX)
**Target Platform**: Mobile browsers (iOS Safari, Android Chrome)
**Project Type**: Mobile web app (SPA)
**Performance Goals**: Notes list renders < 1s; auto-save triggers ≤ 800ms after pause;
  attachments visible < 2s after note opens
**Constraints**: Framework7-only UI; TanStack Query for all server state; files must be
  fetched with auth header (no direct `<img src>`); note title is the only editable
  text field; no body/content field in backend
**Scale/Scope**: 2 new pages; 5 new components; 8 new hooks; 1 new API module

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Mobile-First** — Dedicated full-screen routes for notes, FAB for creation,
      gallery grid optimised for touch.
- [x] **II. Minimalist Layout** — NoteCard shows title + attachment count only. Note
      detail shows the editable title field, gallery, and upload/delete controls — no
      clutter.
- [x] **III. Framework7** — Navbar, Page, Fab, List, ListInput, PhotoBrowser, Sheet,
      Actions — all native F7 primitives.
- [x] **IV. Custom Components** — NoteCard, NoteEmptyState, AttachmentGallery,
      AttachmentItem, DeleteNoteDialog — built from scratch to F7 visual standards.
- [x] **V. TanStack Query** — `useNotes`, `useNote`, `useCreateNote`, `useUpdateNote`,
      `useDeleteNote`, `useUploadAttachment`, `useDeleteAttachment`, `useBlobUrl` — all
      server state through hooks. No bare fetch in components.
- [ ] **VI. Optimistic UI** — Note create + title update are optimistic. Attachment
      delete is optimistic. Note delete is non-optimistic (5-second countdown, same
      justification as notebook delete). Attachment upload is non-optimistic (fileSrcId
      only known after server response). Both exceptions documented below.
- [x] **VII. Cache Integrity** — All mutations invalidate the relevant query keys on
      settled. `['notes', notebookId]` list is marked stale (refetchType: none) from
      the note detail page, re-fetching on next home/list visit.
- [x] **VIII. Clean Code** — Single-responsibility per hook/component/api file.
- [x] **IX. No Unit Tests** — No test files planned.
- [x] **X. Maintainability** — New files under `src/components/notes/` and
      `src/hooks/`; follows existing patterns from features 002–003.

## Project Structure

### Documentation (this feature)

```text
specs/004-notes-attachments/
├── plan.md                          # This file
├── research.md                      # Phase 0 output
├── data-model.md                    # Phase 1 output
├── quickstart.md                    # Phase 1 output
├── contracts/
│   ├── backend-notes-api.md         # Phase 1 output
│   └── backend-files-api.md         # Phase 1 output
└── tasks.md                         # /speckit-tasks output
```

### Source Code

```text
src/
├── api/
│   ├── client.js              ← UPDATE: add getBlob(), postForm() helpers
│   └── notes.js               ← NEW: notes + attachments CRUD
├── hooks/
│   ├── useNotes.js            ← NEW: useQuery(['notes', notebookId])
│   ├── useNote.js             ← NEW: useQuery(['note', notebookId, noteId])
│   ├── useCreateNote.js       ← NEW: useMutation + optimistic list insert
│   ├── useUpdateNote.js       ← NEW: useMutation + optimistic title update
│   ├── useDeleteNote.js       ← NEW: useMutation (non-optimistic)
│   ├── useUploadAttachment.js ← NEW: useMutation (non-optimistic file upload)
│   ├── useDeleteAttachment.js ← NEW: useMutation + optimistic removal
│   └── useBlobUrl.js          ← NEW: useQuery(['file', fileSrcId]) → data URL
├── pages/
│   ├── CreateNotePage.jsx     ← NEW: title field + image picker + submit
│   └── NoteDetailPage.jsx     ← NEW: debounced title + gallery + delete
├── components/
│   └── notes/
│       ├── NoteCard.jsx         ← NEW: title + attachment count
│       ├── NoteEmptyState.jsx   ← NEW: empty state
│       ├── AttachmentGallery.jsx ← NEW: grid + PhotoBrowser trigger + upload btn
│       └── AttachmentItem.jsx   ← NEW: image thumb or file placeholder + download
├── pages/
│   └── NotebookDetailPage.jsx ← UPDATE: replace placeholder with notes list + FAB
└── App.jsx                    ← UPDATE: add 2 new protected routes
```

**Structure Decision**: New `src/components/notes/` directory for note-specific
components, parallel to the existing `src/components/notebooks/` directory.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle VI: note delete is non-optimistic | Same reason as notebook delete — 5-second countdown makes the intentional slowness explicit; rollback would be confusing after the user waited. | Optimistic delete was rejected: the countdown already communicates "this is destructive and slow"; removing the item instantly before server confirms creates a false sense of completion. |
| Principle VI: attachment upload is non-optimistic | The attachment's `fileSrcId` (needed to display the file) is only returned by the server after the upload completes. There is no client-side value to optimistically insert. | A placeholder with a spinner was considered as an optimistic entry, but it would require a reconciliation step (matching the placeholder to the real attachment) that adds significant complexity for minimal UX gain on a file upload. |
| Principle V: direct `getBlob` call in `AttachmentItem` download handler | The non-image file download is a fire-and-forget browser action: fetch blob → `URL.createObjectURL` → programmatic `<a download>` click → `URL.revokeObjectURL`. There is no server state to cache, manage, or invalidate. | Wrapping in `useMutation` was rejected: the returned blob URL must be revoked synchronously immediately after the click to prevent memory leaks, which is incompatible with TanStack Query's async settlement lifecycle. A `useQuery` variant was rejected because the blob URL is one-time-use and caching it would consume memory without benefit (unlike `useBlobUrl` which caches the reusable data URL). |
