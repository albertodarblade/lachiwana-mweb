# Quickstart: Notebook Detail View

**Feature**: `003-notebook-detail` | **Date**: 2026-04-29

---

## Prerequisites

1. At least one notebook created (use `/speckit-implement` result from feature 002).
2. Backend running, `LACHIWANA_SERVICE_URL` set in `.env.local`.
3. `pnpm dev` running.

---

## Testing US1 — Open Notebook Detail

1. Sign in and land on the home page.
2. Tap any notebook card.
3. Verify: URL changes to `/notebooks/:id`.
4. Verify: toolbar background matches the notebook's color (or default theme color if none set).
5. Verify: toolbar shows the notebook's icon on the left of the title.
6. Verify: toolbar shows the notebook's title as the heading.
7. Verify: an options menu button (⋯) is visible on the right.
8. Verify: "Notas vacías" placeholder appears in the content area.
9. Tap the back button — verify you return to the notebooks list.

---

## Testing US2 — Edit Notebook

1. Open a notebook detail.
2. Tap the options menu → tap "Editar".
3. Verify: edit sheet opens pre-filled with the notebook's current title, description,
   color, icon, and member list.
4. Change the title to something new.
5. Tap save.
6. Verify: the toolbar title updates immediately (optimistic — before server responds).
7. Navigate back → verify the list card shows the updated title.

**Test optimistic rollback**:
1. Stop the backend.
2. Open the edit sheet, change the title, save.
3. Verify: title updates briefly (optimistic), then reverts to the original after the
   error is received.
4. Verify: a toast error appears at the top of the view.

---

## Testing US3 — Delete Notebook (Owner)

1. Open a notebook you own.
2. Tap the options menu → verify "Editar" AND "Eliminar" are shown.
3. Tap "Eliminar".
4. Verify: confirmation dialog opens with the confirm button DISABLED.
5. Verify: a countdown from 5 to 0 is visible.
6. Try tapping the confirm button before countdown ends — verify it does not respond.
7. After countdown reaches 0, tap "Eliminar" (confirm button now enabled).
8. Verify: loading indicator shows on the button.
9. After server responds: verify you are navigated back to the list.
10. Verify: the deleted notebook no longer appears in the list.

**Test delete error**:
1. Stop the backend.
2. Open a notebook you own → options → "Eliminar" → wait countdown → confirm.
3. Verify: request times out, toast error appears.
4. Verify: the list is unchanged (notebook still there after navigating back).

---

## Testing US3 — Delete Not Available for Members

1. Sign in as a user who is a **member** (not owner) of a notebook.
2. Open that notebook's detail view.
3. Tap the options menu.
4. Verify: only "Editar" is shown; "Eliminar" is absent.

---

## Verifying Toast Error Behavior

1. Trigger any failing mutation (stop backend, try to save).
2. Verify: toast appears at the TOP of the detail view.
3. Verify: toast disappears after ~3 seconds.
4. Verify: the toast message is descriptive (not just "Error").
