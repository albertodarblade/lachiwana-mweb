# Feature Specification: Notebooks UI

**Feature Branch**: `002-notebooks-ui`
**Created**: 2026-04-28
**Status**: Draft
**Input**: User description: "the BE implement a new endpoint for notebooks, we need to create the UI to use those endpoints, the home page should show lachiwana as app name, the logged user at the right, and the list of notebooks below the toolbar should show, should show a Crear Cuaderno button para crear nuevos cuadernos, si no hay cuadernos creados debe mostrar un placeholder que diga que no tiene cuadernos creados when the user click on create button should move to another page for notebook creation form, allowing the user to create new notebooks, on members field should support multiuser selector"

## Clarifications

### Session 2026-04-28

- Q: What information should each notebook card in the list display? → A: Title + color indicator + icon.
- Q: Should the member picker include a search/filter input? → A: Yes — a search input that filters users by name or email in real time.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Notebooks Home Page (Priority: P1)

An authenticated user opens the app and sees the home page redesigned with the app name
"Lachiwana" in the toolbar, their profile avatar and name on the right side of the toolbar,
and a scrollable list of all notebooks they own or are a member of. A "Crear Cuaderno"
action button is always visible. When the user has no notebooks, a placeholder message
replaces the empty list.

**Why this priority**: This is the main application screen that all users interact with
on every session. Without this, no other notebook feature is accessible.

**Independent Test**: Sign in and land on the home page. Verify the toolbar shows
"Lachiwana" and the logged-in user's name/avatar. Verify the notebooks list renders for
users with notebooks. Verify the empty-state placeholder renders for users with no
notebooks. Verify the "Crear Cuaderno" button is visible in both states.

**Acceptance Scenarios**:

1. **Given** an authenticated user on the home page, **When** the page loads, **Then**
   the toolbar displays "Lachiwana" as the app name on the left and the user's name and
   avatar on the right.
2. **Given** a user who has notebooks, **When** the home page loads, **Then** a list of
   notebook cards is displayed showing each notebook's title, color indicator, and icon.
3. **Given** a user who has no notebooks, **When** the home page loads, **Then** a
   placeholder message is displayed informing the user they have no notebooks yet.
4. **Given** the home page is loaded, **When** the user views it, **Then** a
   "Crear Cuaderno" button is visible regardless of whether notebooks exist.
5. **Given** the home page is loaded, **When** the notebooks list is displaying,
   **Then** the list includes notebooks the user owns AND notebooks they are a member of.

---

### User Story 2 - Create a Notebook (Priority: P2)

An authenticated user taps "Crear Cuaderno" on the home page, is taken to a dedicated
creation form, fills in the notebook title (required) and optional fields including
description, color, and one or more members selected from a multi-user picker. After
submitting, the user is returned to the home page where the new notebook appears in the
list immediately.

**Why this priority**: Creating notebooks is the core action of the application. Without
it, the home page list is always empty.

**Independent Test**: From the home page tap "Crear Cuaderno". The creation page must
render. Enter a title. Select at least one member from the picker. Submit. The home page
must show the new notebook in the list without a manual refresh.

**Acceptance Scenarios**:

1. **Given** the home page, **When** the user taps "Crear Cuaderno", **Then** a
   dedicated notebook creation page is displayed with a form.
2. **Given** the creation form, **When** the user leaves the title field empty and
   attempts to submit, **Then** submission is blocked and the title field is highlighted
   as required.
3. **Given** the creation form with a valid title, **When** the user submits, **Then**
   the notebook is created, the user is returned to the home page, and the new notebook
   appears in the list.
4. **Given** the creation form, **When** the user taps the Members field, **Then** a
   multi-user picker opens showing all registered users with their name, email, and
   avatar.
5. **Given** the multi-user picker, **When** the user selects multiple users, **Then**
   all selected users are shown as chosen members and will be added to the notebook on
   submit.
6. **Given** the creation form, **When** the user taps "back" or cancels without
   submitting, **Then** no notebook is created and the user returns to the home page.

---

### Edge Cases

- What happens when the notebooks list fails to load? An error message is displayed with
  a retry option; the "Crear Cuaderno" button remains functional.
- What happens when the creation form fails to submit? An error message is displayed and
  the form data is preserved so the user does not lose their input.
- What happens when the registered users list is empty in the member picker? The picker
  displays an empty state indicating no other users are available.
- What happens when the user is the only registered user? The members field is available
  but the picker shows no users to select (other than themselves, who is always the
  owner).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The home page toolbar MUST display "Lachiwana" as the application name.
- **FR-002**: The home page toolbar MUST display the authenticated user's name and
  profile avatar on the right side.
- **FR-003**: The home page MUST display a scrollable list of all notebooks the
  authenticated user owns or is a member of.
- **FR-004**: Each notebook card in the list MUST display the notebook's title, a visual
  color indicator when a color is set, and the notebook's icon when one is set.
- **FR-005**: The home page MUST display a "Crear Cuaderno" button that is always
  visible, whether or not notebooks exist.
- **FR-006**: When the authenticated user has no notebooks, the home page MUST display
  a placeholder message indicating no notebooks have been created yet.
- **FR-007**: Tapping "Crear Cuaderno" MUST navigate the user to a dedicated notebook
  creation page (not a modal or dialog).
- **FR-008**: The notebook creation page MUST include a required Title field.
- **FR-009**: The notebook creation page MUST include an optional Description field.
- **FR-010**: The notebook creation page MUST include an optional Color selector
  allowing the user to choose a display color for the notebook.
- **FR-010b**: The notebook creation page MUST include an optional Icon selector
  allowing the user to choose an icon to represent the notebook.
- **FR-011**: The notebook creation page MUST include an optional Members field
  that opens a multi-user picker. The picker MUST include a real-time search input that
  filters the user list by name or email. Each user entry MUST show their name, email,
  and avatar. The user may select zero or more members.
- **FR-012**: Attempting to submit the creation form with an empty title MUST be
  prevented with a visible validation message.
- **FR-013**: Successfully submitting the creation form MUST create the notebook,
  navigate back to the home page, and display the new notebook in the list without
  requiring a manual refresh.
- **FR-014**: The home page notebook list MUST update immediately after a notebook is
  created, reflecting the new entry.

### Key Entities

- **Notebook**: Represents a collaborative notebook. Attributes: `id`, `title`,
  `description` (optional), `color` (optional display color), `iconName` (optional icon
  identifier), `owner` (the creating user's identifier), `users` (list of member user
  identifiers), `createdAt`, `updatedAt`.
- **NotebookMember**: A registered user selectable as a notebook member. Attributes:
  `googleId`, `name`, `email`, `picture`. Drawn from the full list of registered users,
  excluding the current owner (who is always the owner, not a member).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The home page loads and displays the notebooks list within 2 seconds on a
  standard mobile connection.
- **SC-002**: A user can complete the full notebook creation flow (tap button → fill
  form → submit) in under 60 seconds.
- **SC-003**: The new notebook appears in the home page list within 1 second of
  successful form submission.
- **SC-004**: The member picker loads and displays all available users within 1 second
  of being opened.
- **SC-005**: The empty-state placeholder is displayed within 500ms for users with no
  notebooks.

## Assumptions

- The home page replaces the existing health-check-only view; the health block is
  removed or moved to a secondary screen.
- The toolbar design follows the mobile-first, minimalist approach: app name on the left,
  user avatar on the right, no additional toolbar items for this feature.
- The "Crear Cuaderno" button label is in Spanish; all other UI labels may be in Spanish
  or English — Spanish is preferred for user-facing labels throughout this feature.
- The member picker sources its user list from the same users endpoint already available
  in the system; the current authenticated user is excluded from the picker (they are
  always the owner).
- Color selection is presented as a limited palette of predefined colors (not a free-text
  input), for a cleaner mobile experience.
- The `iconName` field is in scope: it is selectable in the creation form and displayed
  on notebook cards. The icon set is sourced from the app's existing icon library
  (Framework7 Icons).
- Notebooks are listed in reverse-chronological order by last updated date.
- The creation form does not support editing existing notebooks; that is a separate
  feature.
