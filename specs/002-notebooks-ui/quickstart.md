# Quickstart: Notebooks UI

**Feature**: `002-notebooks-ui` | **Date**: 2026-04-28

---

## Prerequisites

1. Backend running at `http://localhost:3000` with notebooks endpoints deployed.
2. `LACHIWANA_SERVICE_URL=http://localhost:3000` in `.env.local`.
3. Frontend dev server: `pnpm dev` → `http://localhost:5175`.
4. Sign in with a Google account.

---

## Testing US1 — Notebooks Home Page

**With notebooks:**
1. Create at least one notebook via the API or by completing US2 first.
2. Navigate to `http://localhost:5175/` (home page).
3. Verify: toolbar shows "Lachiwana" on the left and the user's avatar on the right.
4. Verify: notebook cards appear, each showing title, color strip, and icon.
5. Verify: the "Crear Cuaderno" FAB is visible at the bottom right.

**Without notebooks (empty state):**
1. Ensure no notebooks exist for the signed-in user (use a fresh account or delete
   existing notebooks directly in the database).
2. Navigate to `http://localhost:5175/`.
3. Verify: "No tienes cuadernos creados" placeholder is shown instead of a list.
4. Verify: the "Crear Cuaderno" FAB is still visible.

**Error state:**
1. Stop the backend server.
2. Reload the home page.
3. Verify: an error message with a retry option is shown; the FAB remains visible.

---

## Testing US2 — Create a Notebook

**Happy path:**
1. From the home page, tap "Crear Cuaderno".
2. Verify: the creation page loads with title, description, color, icon, and members fields.
3. Enter a title (e.g., "Test Notebook").
4. Select a color swatch.
5. Select an icon from the grid.
6. Tap the Members field → the picker sheet opens.
7. Type a name or email in the search bar — verify the list filters in real time.
8. Select one or more users → tap "Listo".
9. Verify: selected users appear in the Members field summary.
10. Tap submit.
11. Verify: you are returned to the home page and the new notebook appears at the top
    of the list immediately (optimistic entry visible before the server responds).
12. Verify: after a moment, `GET /api/v1/notebooks` is re-fetched and the card remains.

**Validation:**
1. On the creation page, leave the title empty and tap submit.
2. Verify: submission is blocked and the title field shows a required error.

**Cancel:**
1. On the creation page, tap the back button without submitting.
2. Verify: no notebook is created; you return to the home page.

**Optimistic rollback:**
1. Stop the backend server while on the creation page.
2. Fill in a title and submit.
3. Verify: the optimistic entry appears momentarily in the list, then disappears with
   an error message after the request fails.

---

## Verifying the Member Picker

1. Open the creation form.
2. Tap the Members field.
3. Verify: the sheet opens with a search bar and all registered users listed (excluding
   the signed-in user).
4. Type part of a user's name — verify the list narrows to matching users only.
5. Clear the search — verify the full list is restored.
6. Select multiple users by tapping their checkboxes.
7. Tap "Listo" — verify the sheet closes and the selected count is shown.
