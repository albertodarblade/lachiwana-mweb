# Feature Specification: Note Tags

**Feature Branch**: `008-note-tags`
**Created**: 2026-05-03
**Status**: Draft
**Input**: User description: "as a user I should able to add tags to my notes, on creation or edition mode, the manage button should appear in the section to allow users to manage tags from that sections, the user can select one or more tags"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Tag a Note During Creation (Priority: P1)

When creating a new note inside a notebook, the user sees a "Gestionar etiquetas" button in the creation form. Tapping it opens a tag picker showing all tags defined on the parent notebook. The user selects one or more tags and closes the picker. When the note is submitted, the selected tags are saved with the note.

**Why this priority**: Tagging at creation time is the primary entry point and proves the tag picker component and API integration work end-to-end.

**Independent Test**: Create a note with two tags selected; verify the saved note returns those tag identifiers.

**Acceptance Scenarios**:

1. **Given** the note creation form is open in a notebook that has tags, **When** the user taps "Gestionar etiquetas", **Then** a tag picker opens showing all tags belonging to that notebook.
2. **Given** the tag picker is open, **When** the user taps a tag, **Then** the tag becomes selected (visually highlighted).
3. **Given** one or more tags are selected, **When** the user closes the picker, **Then** the selection is reflected on the button label (e.g., "2 etiquetas seleccionadas").
4. **Given** the user submits the creation form, **Then** the note is saved with the selected tags.
5. **Given** the notebook has no tags defined, **When** the user taps "Gestionar etiquetas", **Then** the picker opens showing an empty state message.
6. **Given** the user opens the picker and closes it without selecting anything, **Then** the note is created with no tags.

---

### User Story 2 - Manage Tags on an Existing Note (Priority: P2)

On the note detail/edit screen, a "Gestionar etiquetas" button is visible in the tags section. Tapping it opens the same tag picker pre-populated with the note's currently selected tags. The user can add or remove tags. Changes are saved when the note form is saved.

**Why this priority**: Editing tags on existing notes completes the full lifecycle; builds on the picker component from P1.

**Independent Test**: Open a note with one tag, add a second, remove the first, save; verify the note now has only the second tag.

**Acceptance Scenarios**:

1. **Given** a note with existing tags is open for editing, **When** the user taps "Gestionar etiquetas", **Then** the picker opens with the note's current tags pre-selected.
2. **Given** the picker is open with pre-selected tags, **When** the user taps a selected tag, **Then** it becomes deselected.
3. **Given** the picker is open, **When** the user taps an unselected tag, **Then** it becomes selected.
4. **Given** the user closes the picker, **When** they save the note, **Then** the updated tag selection is persisted.
5. **Given** the user closes the picker without saving the note form, **Then** the note's tags remain unchanged.

---

### User Story 3 - View Tags on Notes List and Detail (Priority: P2)

Tags assigned to a note are displayed as visual chips on the note card in the notes list and in a dedicated section on the note detail screen. This gives the user immediate visual context about a note's classification without opening it.

**Why this priority**: Completes the read path — without display, tagging has no visible outcome for the user.

**Independent Test**: Assign two tags to a note, return to the notes list, and verify both tag chips appear on the note card; open the note detail and verify the same chips are visible.

**Acceptance Scenarios**:

1. **Given** a note has one or more assigned tags, **When** the user views the notes list, **Then** each note card shows the assigned tag chips (icon + title).
2. **Given** a note has no assigned tags, **When** the user views the notes list, **Then** no tag chips appear on that card.
3. **Given** a note has assigned tags, **When** the user opens the note detail screen, **Then** the tags are displayed as chips in a dedicated tags section.
4. **Given** the user edits tags on the note detail screen and saves, **Then** the updated chips are immediately reflected in both the detail screen and the notes list without a manual reload.

---

### Edge Cases

- What if the notebook's tags change (a tag is deleted from the notebook) after a note already references it? → The note retains the tag ID; if the tag no longer exists in the notebook, it is silently ignored when displaying.
- What if the user selects all available tags? → Allowed; no maximum enforced at the frontend.
- What if the note is in a notebook with no tags? → The picker shows an empty state; user can still save the note with no tags.
- What if the picker is opened but no changes are made and then closed? → The note's tag selection remains unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The note creation form MUST include a "Gestionar etiquetas" button that opens a tag picker.
- **FR-002**: The note edit screen MUST include a "Gestionar etiquetas" button that opens a tag picker.
- **FR-003**: The tag picker MUST display all tags defined on the parent notebook.
- **FR-004**: The tag picker MUST allow the user to select and deselect individual tags.
- **FR-005**: The tag picker MUST support selecting zero, one, or multiple tags simultaneously.
- **FR-006**: The tag picker MUST show currently selected tags as visually distinct from unselected tags.
- **FR-007**: The "Gestionar etiquetas" button label MUST reflect the current selection count when one or more tags are selected.
- **FR-008**: The note creation form MUST include the selected tag identifiers when submitting to the creation endpoint.
- **FR-009**: The note edit screen MUST persist the updated tag selection when the note is saved.
- **FR-010**: When the notebook has no tags, the picker MUST display an empty state message rather than an error.
- **FR-011**: Each note card in the notes list MUST display the note's assigned tags as chips (icon + title) when one or more tags are assigned.
- **FR-012**: The note detail screen MUST display the note's assigned tags as chips in a visible tags section.
- **FR-013**: The note detail screen MUST include a "Gestionar etiquetas" button that opens the tag picker to edit the assignment without navigating away.

### Key Entities

- **Note Tag Assignment**: A reference from a note to a notebook-level tag, stored as the tag's identifier. A note can hold zero or more assignments. Assignments have no independent lifecycle — they are part of the note.
- **Notebook Tag**: Defined at the notebook level (see feature 007). The note picker reads from this collection; it does not create or modify notebook tags.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can open the tag picker, select tags, and close it in under 30 seconds for a notebook with up to 20 tags.
- **SC-002**: Selected tags are persisted on note save and visible on the note immediately after saving, with no additional reload required.
- **SC-003**: The tag picker correctly pre-selects existing tags when opened from a note that already has tags assigned.
- **SC-004**: 100% of tag selections are submitted with the note payload and returned in subsequent note reads.
- **SC-005**: Tag chips appear on note cards in the notes list immediately after a note with tags is loaded, with no additional interaction required.
- **SC-006**: Tag edits made from the note detail screen are reflected in both the detail view and the notes list immediately after saving.

## Clarifications

### Session 2026-05-03

- Q: Should assigned tags be visible after saving, and where? → A: Tags are displayed in the notes list (on each note card) and on the note detail screen; the user can also edit tag assignments directly from the note detail screen (not only from the creation form).

## Assumptions

- Note tags are stored as an array of tag identifier strings referencing the parent notebook's tag objects.
- The tag picker for notes shows the notebook's tags (read-only from the note's perspective) — users cannot create, edit, or delete notebook tags from this picker.
- Tag identifiers are the backend-generated IDs of the notebook's tag sub-documents.
- If a notebook tag is later deleted, notes that referenced it may retain stale identifiers; this is handled gracefully (ignored on display) without requiring cleanup.
- The tag picker for notes uses the same visual style (Sheet with drag handle, `height: 'auto'`, `backdrop`) as all other pickers in the app.
- Tags selected during note creation are held in local state and sent with the creation payload (no immediate API call per tag selection).
- Tags selected during note editing are held in local state and sent with the note update payload when the user saves — no immediate per-selection API call.
