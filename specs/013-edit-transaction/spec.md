# Feature Specification: Edit Transaction

**Feature Branch**: `013-edit-transaction`
**Created**: 2026-05-10
**Status**: Draft
**Input**: User description: "as a user I should be able to edit a transaction, I should able to edit the tags, the amount, the content, the date, if is income or expense, should not exist a save button, each update is debounced and based on user input, should be similar to create transaction form behavior"

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Edit Amount and Type (Priority: P1)

A user notices that a transaction has the wrong amount or wrong type (income vs. expense). They open the transaction, correct the amount and toggle the type. The change is persisted automatically after they stop editing — no save button is required.

**Why this priority**: Amount and type are the most critical fields in a transaction. Errors in these fields directly affect the user's financial records.

**Independent Test**: Can be fully tested by opening an existing transaction, changing the amount from one value to another, toggling the type, and verifying the updated values are reflected after a brief pause — without pressing any save button.

**Acceptance Scenarios**:

1. **Given** an existing transaction is open for editing, **When** the user changes the amount, **Then** the new amount is saved automatically after the user stops typing
2. **Given** an existing transaction is open for editing, **When** the user toggles the type from expense to income (or vice versa), **Then** the transaction sign updates and the change is persisted automatically
3. **Given** the user enters an invalid amount (zero or non-numeric), **When** the user stops typing, **Then** the system shows a validation message and does not save the invalid value

---

### User Story 2 — Edit Content, Date, and Tags (Priority: P2)

A user wants to correct the description, change the date, or update the tags on an existing transaction. They open the transaction and make the changes. Each change is auto-saved independently as the user edits, with no explicit save action needed.

**Why this priority**: Content, date, and tags are contextual enrichment fields. Their editing follows the same auto-save contract as US1 but addresses a different set of fields.

**Independent Test**: Can be fully tested by opening a transaction, changing the description text, selecting a different date, and adding/removing a tag — then verifying all three changes are persisted after a brief pause.

**Acceptance Scenarios**:

1. **Given** an existing transaction is open, **When** the user changes the description text, **Then** the new description is saved automatically after the user stops typing
2. **Given** an existing transaction is open, **When** the user selects a different date, **Then** the new date is saved immediately upon selection
3. **Given** an existing transaction is open, **When** the user adds or removes a tag, **Then** the tag change is saved automatically

---

### Edge Cases

- What happens if the user clears the amount field entirely? The system should prevent saving an empty amount and show guidance.
- What if a save fails due to a network error? The system must show an error state and retain the unsaved value so the user can retry.
- What if the user makes rapid successive changes? Each change resets the debounce timer so only the final state is saved.
- What if the user closes the edit form while a save is in progress? The header shows "Guardando…" while the save completes, then the form closes automatically — the same closing pattern used by the note editor.
- What if no tags exist in the notebook? The tag field shows an empty state without blocking the rest of the form.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Users MUST be able to open an existing transaction and see its current values pre-filled in all editable fields
- **FR-002**: Users MUST be able to change the transaction amount to any valid non-zero number
- **FR-003**: Users MUST be able to toggle the transaction type between income and expense
- **FR-004**: Users MUST be able to change the transaction date using the same date picker as the create form
- **FR-005**: Users MUST be able to edit the transaction content (description text)
- **FR-006**: Users MUST be able to add or remove tags on the transaction
- **FR-007**: System MUST reflect every field change instantly in the UI as the user edits (optimistic update), then auto-save to the server after the user stops input (debounced); if the save fails, the field MUST roll back to its last confirmed value
- **FR-007a**: The debounce delay MUST match the create transaction form (approximately 300ms after the user stops typing)
- **FR-008**: System MUST NOT display a manual save button — all persistence is automatic
- **FR-009**: System MUST display a save-status indicator in the form header — using the same component and states as the note editor ("Guardando…", "Guardado", error state) — that updates in real time as changes are saved
- **FR-010**: System MUST validate the amount field and prevent saving if the value is zero, empty, or non-numeric
- **FR-011**: System MUST show an error message and preserve unsaved changes if a save operation fails
- **FR-012**: The edit form MUST follow the same visual layout and interaction patterns as the create transaction form

### Key Entities

- **Transaction**: The record being edited; has fields: value (numeric, sign encodes type), date, content (optional text), tags (list of tag references)
- **Transaction Type**: Income (positive value) or Expense (negative value); toggling the type flips the sign of the stored value
- **Save Status**: A transient UI state displayed in the form header, following the same component and labels as the note editor — "Guardando…" (write in progress), "Guardado" (last change confirmed), and an error state when persistence fails

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All changes made to a transaction are persisted within 2 seconds of the user stopping input, without any manual save action
- **SC-002**: Users can complete a full transaction edit (amount, type, date, content, tags) in under 90 seconds
- **SC-003**: The save-status indicator accurately reflects the real persistence state 100% of the time
- **SC-004**: Invalid amount entries (zero, empty, non-numeric) are caught before saving in 100% of cases
- **SC-005**: Network errors during save are surfaced to the user within 5 seconds with the unsaved value retained

## Clarifications

### Session 2026-05-10

- Q: How does the user access the edit form? → A: By tapping on an existing transaction card in the transactions list
- Q: Does the debounce delay match the create form? → A: Yes — same delay (approximately 300ms after the user stops input)
- Q: Should changes reflect instantly in the UI while auto-save runs in background? → A: Yes — optimistic updates; rollback to last confirmed value on save failure
- Q: What happens when the user closes the form during a save? → A: Show "Guardando…" in header until save completes, then auto-close — same pattern as note editor's SaveStatusIndicator
- Q: Is an empty description/content allowed? → A: Yes — content is optional; only amount is required

## Assumptions

- The edit form opens as a bottom sheet, consistent with the create transaction form
- Pre-filling all fields with the existing transaction values is always possible since the data is already loaded in the view
- The transaction type toggle (income/expense) is presented in the same way as in the create form
- Tag selection uses the existing tag selection sheet component
- Date selection uses the same native date picker as the create form
- Only the currently authenticated user's own transactions (or transactions they have access to) can be edited
- The edit form does not support deleting a transaction — deletion remains a separate action
