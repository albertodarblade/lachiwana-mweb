# Feature Specification: Notebook Tags Management

**Feature Branch**: `007-notebook-tags`  
**Created**: 2026-05-03  
**Status**: Draft  
**Input**: User description: "the BE has tags endpoints for the notebooks, the user should be able to add tags or manage on its own popup component, the user should be able to add tags, delete tags or edit a tag, for the project, on create notebook form the user can create tags edit and delete, and send them to creation endpoint, on edit notebook, the user can edit the tags of the project, should be under manage button, the managebutton will show the popup component to add, edit or delete tags for that project."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Notebook with Tags (Priority: P1)

A user filling out the Create Notebook form wants to add one or more tags before saving. They tap an "Add tags" or similar button that opens the Tags popup. Inside the popup they add tags (each with a title and an icon), and can also edit or remove any tag they just added. When they submit the form, the tags are sent together with the notebook data to the creation endpoint.

**Why this priority**: Tags created at notebook-creation time are the primary entry point for the feature. If this flow works, the popup component exists and the API integration is proven.

**Independent Test**: Create a notebook with two tags and verify the saved notebook returns those tags from the API.

**Acceptance Scenarios**:

1. **Given** the Create Notebook form is open, **When** the user taps the tags area or "Manage Tags" button, **Then** the Tags Popup opens in an empty state (no tags yet).
2. **Given** the Tags Popup is open, **When** the user enters a title and selects an icon then confirms, **Then** the new tag appears in the list inside the popup.
3. **Given** the Tags Popup has one or more tags, **When** the user taps edit on a tag, changes its title or icon, and confirms, **Then** the tag updates in the list.
4. **Given** the Tags Popup has one or more tags, **When** the user taps delete on a tag and confirms, **Then** the tag is removed from the list.
5. **Given** the user has configured tags in the popup and closed it, **When** they submit the Create Notebook form, **Then** the notebook is saved with all configured tags and the tags are visible when the notebook is reloaded.
6. **Given** the Create Notebook form is submitted with no tags, **When** the notebook is created, **Then** the notebook is saved with an empty tags array (tags are optional).

---

### User Story 2 - Edit Notebook Tags (Priority: P2)

A user viewing the Edit Notebook form wants to update the tags already assigned to a notebook. A "Manage Tags" button opens the Tags Popup pre-populated with the current tags. The user adds, edits, or removes tags and closes the popup. On saving the form, the updated tag list is persisted.

**Why this priority**: Builds on the popup component from P1. Editing is the second most common tags action after initial creation.

**Independent Test**: Open an existing notebook with two tags, remove one, add another, save, and verify the notebook now shows the correct updated tag list.

**Acceptance Scenarios**:

1. **Given** the Edit Notebook form is open for a notebook with existing tags, **When** the user taps "Manage Tags", **Then** the Tags Popup opens pre-populated with the notebook's current tags.
2. **Given** the Tags Popup is pre-populated, **When** the user adds a new tag, **Then** the new tag appears alongside the existing ones.
3. **Given** the Tags Popup is pre-populated, **When** the user deletes an existing tag, **Then** it is removed from the list immediately.
4. **Given** the user closes the Tags Popup after making changes, **When** they save the Edit Notebook form, **Then** the notebook is updated with the new tag list.
5. **Given** the user opens the Tags Popup and makes changes but navigates away without saving the form, **Then** the original tags remain unchanged on the notebook.

---

### User Story 3 - Tag Icon Selection (Priority: P3)

When adding or editing a tag, the user must select an icon (in addition to providing a title). The icon picker presents the same icon set already used elsewhere in the app (e.g., the notebook icon selector).

**Why this priority**: The tag schema requires both `title` and `icon`, so icon selection is mandatory, but the UX detail of how icons are picked is lower priority than the core CRUD flows.

**Independent Test**: Add a tag, pick a specific icon, save the notebook, and verify the tag returns with the correct icon identifier.

**Acceptance Scenarios**:

1. **Given** the tag form is open, **When** the user taps the icon field, **Then** an icon picker appears showing available icons.
2. **Given** an icon is selected, **When** the user views the tag in the list, **Then** the selected icon is displayed next to the title.
3. **Given** the user tries to confirm a tag without selecting an icon, **Then** an inline validation message prompts them to pick an icon before proceeding.

---

### User Story 4 - View Tags on Notebook Detail (Priority: P3)

A user opens a notebook detail screen and can see the tags assigned to that notebook displayed as visual chips or badges near the top of the page. This gives quick context about what the notebook is about without needing to open the management popup.

**Why this priority**: Read-only display is lower priority than the management flows but completes the user-facing value of the feature.

**Independent Test**: Open a notebook with two tags and verify both tags appear as chips on the detail screen with their title and icon visible.

**Acceptance Scenarios**:

1. **Given** a notebook has one or more tags, **When** the user opens the notebook detail screen, **Then** each tag is displayed as a chip showing its icon and title.
2. **Given** a notebook has no tags, **When** the user opens the detail screen, **Then** no tag chips are shown (the area is empty or hidden).
3. **Given** tags are updated via the Edit Notebook flow, **When** the user returns to the detail screen, **Then** the updated tag chips are reflected without requiring a manual reload.

---

### Edge Cases

- What happens if a tag title is empty or whitespace only? → The tag form should not allow confirmation; inline validation prevents blank titles.
- What happens if the user adds duplicate tag titles within the same notebook? → Allowed (no uniqueness enforced; the backend schema does not restrict duplicates).
- What happens if the Tags Popup is dismissed without any changes? → The notebook's tag list remains exactly as it was before the popup was opened.
- What happens when a tag API call fails in the edit flow (e.g., network error on add/edit/delete)? → The popup shows an inline error for that specific tag action; the user can retry without losing other already-saved tags.
- What happens when the notebook save fails after tags were configured in the create flow? → The form remains open with the configured tags intact so the user can retry.
- What happens on slow networks while saving? → The save button shows a loading state and the form is disabled until the operation completes or fails.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a reusable Tags Popup component that can be opened from any notebook form.
- **FR-002**: The Tags Popup MUST allow the user to add a new tag with a required title (non-empty, trimmed) and a required icon.
- **FR-003**: The Tags Popup MUST allow the user to edit the title or icon of any tag currently in the list.
- **FR-004**: The Tags Popup MUST allow the user to delete any tag currently in the list.
- **FR-005**: The Tags Popup MUST display all current tags in the list with their title and icon visible.
- **FR-006**: The Create Notebook form MUST include a way to open the Tags Popup to configure tags before submission.
- **FR-007**: The Create Notebook form MUST include the configured tags as a full array in the notebook creation request.
- **FR-008**: The Edit Notebook form MUST include a "Manage Tags" button that opens the Tags Popup pre-populated with the notebook's existing tags.
- **FR-009**: In the Edit Notebook flow, each tag change (add, edit, delete) MUST be sent immediately to the corresponding dedicated tag endpoint when the user confirms the change inside the popup; changes are not batched until notebook form save.
- **FR-010**: In the Create Notebook flow, tag changes made in the popup are held in local state and only sent to the server when the Create form is submitted; closing the popup without submitting the form discards all configured tags.
- **FR-013**: The notebook detail screen MUST display the notebook's tags as visual chips, each showing the tag's icon and title.
- **FR-014**: The tag chips on the notebook detail screen MUST reflect the current tag state after any edit without requiring a manual page reload.
- **FR-011**: The system MUST prevent confirming a tag with an empty or whitespace-only title, showing an inline validation message.
- **FR-012**: The system MUST prevent confirming a tag without a selected icon, showing an inline validation message.

### Key Entities

- **Tag**: A label attached to a notebook. Has a `title` (display text) and an `icon` (identifier from the app's icon set). Tags are embedded within a notebook and have no independent lifecycle.
- **Notebook**: The parent entity. Carries a `tags` array that is set on creation and updated on edit.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can add, edit, and delete tags within the popup in under 60 seconds for a set of up to 10 tags.
- **SC-002**: Tags configured during notebook creation are persisted and visible on the notebook detail screen immediately after saving, with no additional reload required.
- **SC-003**: Tags configured during notebook editing are persisted and reflected in the notebook list and detail screens immediately after saving.
- **SC-004**: 100% of tags with invalid data (empty title or no icon) are rejected before reaching the server, with clear inline feedback to the user.
- **SC-005**: The Tags Popup component is reusable across both the Create Notebook and Edit Notebook flows without duplication of behaviour.

## Clarifications

### Session 2026-05-03

- Q: Does the edit flow use dedicated tag endpoints or send the full tags array in the notebook update payload? → A: Hybrid — full tags array sent on notebook creation; dedicated per-tag endpoints (`POST`, `PATCH`, `DELETE` on `/notebooks/:id/tags/:tagId`) used on the edit flow.
- Q: Should tags be displayed outside the management popup? → A: Yes, on the notebook detail screen only — shown as chips/badges; not shown on notebook list cards.
- Q: In the edit flow, should tag actions be sent immediately to the API or batched until notebook form save? → A: Immediate — each add/edit/delete calls the dedicated tag endpoint the moment the user confirms it inside the popup.

## Assumptions

- Tags are optional on a notebook; a notebook with zero tags is fully valid.
- The icon set available for tags is the same icon set already used by the notebook icon selector (`IconSelector` component).
- Tag uniqueness within a notebook is not enforced (duplicate titles are permitted).
- On **creation**: tags are included as a full array in the `POST /notebooks` request payload.
- On **editing**: each tag action is sent immediately when confirmed in the popup — adding calls `POST /notebooks/:id/tags`, editing calls `PATCH /notebooks/:id/tags/:tagId`, deleting calls `DELETE /notebooks/:id/tags/:tagId`. Changes are not batched; the notebook form Save button does not re-send tag data.
- The backend `Tag` sub-document requires both `title` and `icon` to be non-empty strings (per the existing schema).
- Tags cannot be shared across notebooks; each notebook owns its tags independently.
- There is no maximum number of tags per notebook enforced at the frontend level.
- The "Manage Tags" button in the Edit Notebook form is accessible to both the notebook owner and members (consistent with the existing edit permission model).
