# Quickstart: Notes & Attachments

**Feature**: `004-notes-attachments` | **Date**: 2026-05-02

---

## Prerequisites

1. Backend running with notes + attachments + files endpoints deployed.
2. `LACHIWANA_SERVICE_URL=http://localhost:3000` in `.env.local`.
3. `pnpm dev` → `http://localhost:5175`.
4. Signed in and at least one notebook exists.

---

## Testing US1 — View Notes List

1. Open a notebook detail page.
2. Verify: notes list renders (replacing the old "Notas vacías" placeholder).
3. For a notebook with no notes: verify empty-state message shows.
4. Verify: "Nueva Nota" FAB is always visible.

---

## Testing US2 — Create a Note

1. Tap "Nueva Nota" → creation form opens.
2. Submit with empty title → verify blocked with validation message.
3. Enter a title → optionally attach an image → submit.
4. Verify: navigated to `/notebooks/:id/notes/:noteId`.
5. Verify: note appears in the notebook's notes list on back navigation.

---

## Testing US3 — Auto-Save Title

1. Open a note detail page.
2. Edit the title field.
3. Stop typing → verify "Guardando…" indicator appears within 1 second.
4. Indicator disappears → navigate back → note card shows updated title.

**Test auto-save failure**:
1. Stop the backend while typing in the title field.
2. Stop typing → verify saving indicator fires → toast error appears.
3. Verify the title field retains the unsaved value.

---

## Testing US4 — Attachment Gallery

**View mixed attachments**:
1. Open a note with at least one image and one non-image attachment.
2. Verify: images show as thumbnails; non-images show a file icon placeholder + "Descargar" button.
3. Tap an image thumbnail → verify fullscreen viewer opens with swipe navigation.
4. Tap "Descargar" on a non-image → verify file downloads.

**Upload a file**:
1. Tap "Agregar archivo" → file picker opens.
2. Select any file → verify upload progress shown.
3. After upload: verify new attachment appears in the gallery.

**Delete an attachment**:
1. Tap the delete control on an attachment → verify confirmation requested.
2. Confirm → verify attachment disappears from gallery immediately (optimistic).
3. **Error case**: stop backend → delete → verify attachment reappears + toast error.

---

## Testing US5 — Delete a Note

1. Open a note → tap the delete action.
2. Verify: confirmation dialog opens with confirm button disabled + countdown shown.
3. Wait 5 seconds → confirm button enables → tap confirm.
4. Verify: navigate back to notebook → note is gone from list.

**Error case**:
1. Stop backend → open dialog → wait countdown → confirm.
2. Verify: toast error shows; dialog stays open for retry.
