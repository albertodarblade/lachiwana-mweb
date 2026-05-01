# Feature Specification: Notebook Detail View

**Feature Branch**: `003-notebook-detail`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "now as a user I want to click and select a notebook redirecting to notebooks/:id this view should show the color, the icon and the title of the notebook in the toolbar, a options menu in the right, to allow edit or delete the notebook, should show a placeholder notas vacias. (the user should be able to edit all the editable fields of the notebook, should able to delete, in case of errors should show a toast message at the top of the view, use optimistic updates, mutations."

## Clarifications

### Session 2026-04-29

- Q: Should the delete action be optimistic (remove immediately before server responds)? → A: No — deletion waits for server confirmation. The list is not updated until the server responds successfully.
- Q: Should there be a safeguard before the user can confirm deletion? → A: Yes — a 5-second countdown timer must complete before the confirm button becomes enabled, preventing accidental deletion.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open Notebook Detail (Priority: P1)

An authenticated user taps a notebook card on the home page and is taken to the detail
view at `/notebooks/:id`. The toolbar reflects the notebook's identity: it is tinted with
the notebook's color, shows its icon on the left, and its title as the heading. An options
menu button sits on the right side of the toolbar. The main body shows a "Notas vacías"
placeholder since note-taking is out of scope for this feature.

**Why this priority**: Without this view, notebooks are purely decorative list items. This
is the entry point for all notebook-level actions (edit, delete).

**Independent Test**: Tap any notebook card → URL changes to `/notebooks/:id` → toolbar
shows the correct color tint, icon, and title → "Notas vacías" placeholder is visible →
options menu button is visible.

**Acceptance Scenarios**:

1. **Given** the notebooks list, **When** the user taps a notebook card, **Then** the app
   navigates to `/notebooks/:id` without a full page reload.
2. **Given** the detail view, **When** the page renders, **Then** the toolbar is tinted
   with the notebook's color, displays its icon on the left, and its title as the heading.
3. **Given** the detail view, **When** the page renders, **Then** a "Notas vacías"
   placeholder is displayed in the content area.
4. **Given** the detail view, **When** the page renders, **Then** an options menu button
   is visible on the right side of the toolbar.
5. **Given** the detail view, **When** the user taps the back button, **Then** they return
   to the notebooks list.

---

### User Story 2 - Edit Notebook (Priority: P2)

An authenticated user (owner or member) opens the options menu on the notebook detail
view and taps "Editar". An edit form opens pre-filled with the notebook's current values
for all editable fields: title, description, color, icon, and members. After saving, the
toolbar and detail view update immediately to reflect the new values, and the notebook
card on the home list also reflects the changes.

**Why this priority**: Editing is the most common post-creation action. Users will need
to rename, recolor, or add members to notebooks regularly.

**Independent Test**: Open a notebook detail → tap options menu → tap "Editar" → form
opens pre-filled → change the title → save → toolbar shows updated title immediately →
navigate back → list card shows updated title.

**Acceptance Scenarios**:

1. **Given** the detail view, **When** the user taps options → "Editar", **Then** an edit
   form opens pre-filled with the notebook's current title, description, color, icon, and
   member list.
2. **Given** the edit form, **When** the user modifies any field and saves, **Then** the
   changes are reflected in the toolbar and detail view immediately (before server
   confirmation).
3. **Given** a save that fails on the server, **When** the error is received, **Then** the
   original values are restored and a toast message appears at the top of the view
   describing the error.
4. **Given** the edit form, **When** the user leaves the title empty and attempts to save,
   **Then** saving is blocked with a visible validation message.
5. **Given** a successful save, **When** the user navigates back to the list, **Then** the
   notebook card reflects the updated values.

---

### User Story 3 - Delete Notebook (Priority: P3)

An authenticated user who is the **owner** of a notebook opens the options menu and taps
"Eliminar". A confirmation dialog is shown with a 5-second countdown. The confirm button
is disabled until the countdown completes, preventing accidental deletion. After the
countdown, the user confirms; the app waits for the server to confirm deletion before
navigating back to the home list and removing the notebook from the list.

**Why this priority**: Deletion is a destructive and irreversible action. The countdown
gate and server-confirmed removal protect owners from losing notebooks by mistake.

**Independent Test**: Open a notebook the signed-in user owns → options menu → "Eliminar"
→ confirmation dialog opens → confirm button is disabled → wait 5 seconds → button
enables → tap confirm → loading state → server responds → navigated back to list →
notebook is gone.

**Acceptance Scenarios**:

1. **Given** the detail view for a notebook the user owns, **When** the user taps options,
   **Then** both "Editar" and "Eliminar" options are shown.
2. **Given** the detail view for a notebook where the user is a member (not owner),
   **When** the user taps options, **Then** only "Editar" is shown; "Eliminar" is absent.
3. **Given** the options menu with "Eliminar" visible, **When** the user taps "Eliminar",
   **Then** a confirmation dialog opens with the confirm button disabled and a visible
   5-second countdown.
4. **Given** the confirmation dialog, **When** the 5-second countdown is running,
   **Then** the confirm button remains disabled and cannot be activated.
5. **Given** the confirmation dialog after the countdown completes, **When** the user
   taps the confirm button, **Then** the app sends the deletion request and shows a
   loading indicator while waiting for the server response.
6. **Given** the server confirms deletion, **When** the response is received, **Then**
   the notebook is removed from the list and the user is navigated back to the home screen.
7. **Given** a deletion that fails on the server, **When** the error is received, **Then**
   no change is made to the list and a toast error message is shown at the top of the view.
8. **Given** the confirmation dialog at any point, **When** the user cancels, **Then** no
   action is taken and the detail view remains open.

---

### Edge Cases

- What if the user navigates directly to `/notebooks/:id` without visiting the list first?
  The app fetches the full notebooks list and displays the matching notebook; if not found,
  an error message is shown with a link back to the home list.
- What if the notebook was deleted by another user while the detail view is open? On the
  next API interaction the view displays an error and navigates the user back to the list.
- What if the server returns a 403 Forbidden on edit or delete? A toast at the top of the
  view explains the user lacks the required permission.
- What if the network is unavailable when saving edits? The optimistic update is shown
  immediately; the toast error appears once the failure is confirmed, and the original
  values are restored.
- What if the network is unavailable when the user confirms deletion? The loading
  indicator shows until the request times out, then the toast error appears and the
  confirmation dialog remains open for retry. The list is never modified.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Tapping a notebook card on the home list MUST navigate to `/notebooks/:id`.
- **FR-002**: The detail view toolbar MUST be tinted with the notebook's color (or the
  default theme color if no color is set).
- **FR-003**: The detail view toolbar MUST display the notebook's icon on the left.
- **FR-004**: The detail view toolbar MUST display the notebook's title as the heading.
- **FR-005**: The detail view MUST display a "Notas vacías" placeholder in the content
  area.
- **FR-006**: The detail view toolbar MUST include an options menu button on the right.
- **FR-007**: The options menu MUST include an "Editar" action available to both the owner
  and members of the notebook.
- **FR-008**: The options menu MUST include an "Eliminar" action that is visible only to
  the notebook owner.
- **FR-009**: Tapping "Editar" MUST open an edit form pre-filled with all current notebook
  values: title, description, color, icon, and member list.
- **FR-010**: Submitting the edit form with valid data MUST update the toolbar and detail
  view immediately without waiting for server confirmation.
- **FR-011**: If an edit mutation fails on the server, the original values MUST be
  restored and a toast error message MUST appear at the top of the view.
- **FR-012**: Tapping "Eliminar" MUST open a confirmation dialog that displays a 5-second
  countdown. The confirm button MUST be disabled until the countdown reaches zero.
- **FR-013**: Once the confirm button is enabled and tapped, the app MUST send the
  deletion request to the server and show a loading indicator. The notebook is removed
  from the home list and the user is navigated back to the home screen only after the
  server confirms successful deletion.
- **FR-014**: If the deletion request fails on the server, the list MUST remain unchanged
  and a toast error message MUST appear at the top of the view. The confirmation dialog
  may remain open to allow a retry.
- **FR-015**: Attempting to save the edit form with an empty title MUST be prevented with
  a visible validation message.
- **FR-016**: The detail view MUST include a back button that returns the user to the
  notebooks list.

### Key Entities

- **Notebook**: Same entity as defined in feature 002. Editable attributes via this
  feature: `title`, `description`, `color`, `iconName`, `users`. The `owner` field is
  read-only and never editable.
- **NotebookMember**: Same as feature 002; the edit form reuses the searchable multi-user
  picker for managing the member list.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The detail view renders with correct toolbar content within 500ms of
  tapping the notebook card (data is already loaded from the list).
- **SC-002**: Optimistic updates for edit are visible within 100ms of the user saving the
  edit form.
- **SC-003**: A user can complete the full edit flow (open form → change fields → save)
  in under 60 seconds.
- **SC-004**: Toast error messages appear within 500ms of a failed mutation response.
- **SC-005**: After confirming deletion and receiving a successful server response,
  navigation back to the list completes within 500ms.

## Assumptions

- The detail view reads notebook data from the already-loaded list. No separate
  single-notebook API endpoint exists; the app resolves the notebook by its `id` from
  the cached list.
- The "Notas vacías" placeholder is static text for this feature; actual note management
  is out of scope and will be addressed in a future feature.
- The edit form is presented as a bottom sheet or modal (not a separate page), to preserve
  context and allow quick saves.
- The options menu is presented as an F7 Actions sheet (native-style action sheet).
- The toolbar color tint uses the notebook's `color` field as the background color with
  white text and icons for contrast.
- If the notebook has no icon set, a default `book` icon is shown in the toolbar.
- If the notebook has no color set, the toolbar uses the app's default theme color.
- The edit form reuses the same color palette and icon selector built in feature 002.
- The edit form reuses the MemberPicker component built in feature 002.
- Deletion is permanent; there is no undo or trash/recycle bin functionality.
