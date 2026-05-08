# Feature Specification: Note Editor Refactor

**Feature Branch**: `009-note-editor-refactor`  
**Created**: 2026-05-04  
**Status**: Draft  
**Input**: User description: "we need to refactor the UI, we will touch create note and edit note, now this forms should be on full size, use its own route, we will use markdown editor https://mdxeditor.dev/, the options we will support, [bold, italic, underline, inline-code-format, numbered-list, checklist, insert-image, undo, redo] this options should appear at the bottom, tag selector and creation date should appear at the top."

## Clarifications

### Session 2026-05-04

- Q: Should save be explicit (button) or automatic (debounced)? → A: Auto-save (debounced); changes persist automatically after a short pause, no save button needed.
- Q: Are images embedded inline in the markdown body or kept as a separate attachment gallery? → A: Inline — images are embedded at cursor position within the markdown content.
- Q: Where does the note title live in the new editor layout? → A: No separate title field; the first line of the markdown content serves as the note's display title automatically.
- Q: How are existing notes (with a separate title field) handled in the new editor? → A: The existing title value is sent as the note's content field; the backend field rename is deferred and handled separately later.
- Q: Which API field does the frontend write markdown content to when saving? → A: The existing `title` field; no API contract changes in this feature — the backend rename is deferred.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a New Note with Rich Text (Priority: P1)

A user navigates to a notebook and taps the create note button. Instead of a bottom sheet popup, they are taken to a full-screen dedicated page where they can write a new note using a markdown editor. The tag selector and the creation date are visible at the top of the page. Formatting tools (bold, italic, underline, inline code, numbered list, checklist, insert image, undo, redo) are available in a toolbar at the bottom of the page.

**Why this priority**: This is the primary entry point for content creation and the core of the refactor. Without this, no note content can be written.

**Independent Test**: Can be fully tested by navigating to a notebook, tapping create, writing formatted content, selecting tags, and saving — delivers a fully usable create-note experience.

**Acceptance Scenarios**:

1. **Given** a user is on the notebook detail page, **When** they tap the create note action, **Then** they are navigated to the full-screen create note page (own route).
2. **Given** the user is on the create note page, **When** they view the page, **Then** tag selector and creation date appear at the top, and the formatting toolbar appears at the bottom.
3. **Given** the user taps a formatting option (bold, italic, underline, inline code, numbered list, checklist), **When** text is selected or cursor is placed, **Then** the corresponding markdown formatting is applied in the editor.
4. **Given** the user taps "insert image", **When** they select an image from their device, **Then** the image is embedded inline at the current cursor position within the note's markdown content.
5. **Given** the user taps undo or redo, **When** there is a previous or future state, **Then** the editor content reverts or advances accordingly.
6. **Given** the user completes writing, **When** they pause typing or navigate back, **Then** the note is automatically saved with its formatted content and selected tags (no explicit save button required).

---

### User Story 2 - Edit an Existing Note with Rich Text (Priority: P1)

A user opens a note and is taken directly to the full-screen editor page (own route) where the existing note content is loaded in the markdown editor for editing. The same layout applies: tag selector and creation date at the top, formatting toolbar at the bottom.

**Why this priority**: Edit is equally critical as create — existing notes must be editable in the new editor experience.

**Independent Test**: Can be fully tested by opening an existing note and verifying content loads, is editable, formatting tools work, and changes are saved.

**Acceptance Scenarios**:

1. **Given** a user taps on an existing note, **When** the note opens, **Then** they are navigated to the full-screen edit note page (own route, e.g., `/notebooks/:notebookId/notes/:noteId/edit`).
2. **Given** the user is on the edit note page, **When** the page loads, **Then** the note's existing markdown content is rendered and editable in the editor.
3. **Given** the user edits content and uses formatting tools, **When** they pause typing or navigate back, **Then** changes are automatically persisted (no explicit save button required).
4. **Given** the tag selector at the top, **When** the user adds or removes tags, **Then** the note's tags are updated accordingly.

---

### User Story 3 - View and Navigate Between Note Pages (Priority: P2)

Users can navigate into and out of the create/edit note pages using standard app navigation (back button, swipe gestures). The note list is accessible after completing or discarding a note.

**Why this priority**: Navigation consistency is important for usability but doesn't block the core editing experience.

**Independent Test**: Can be fully tested by creating/editing a note and verifying the back navigation returns to the correct notebook view.

**Acceptance Scenarios**:

1. **Given** the user is on the create or edit note page, **When** they tap the back button or use a swipe gesture, **Then** any pending changes are auto-saved and the user returns to the notebook detail page without interruption.
2. **Given** a note is saved, **When** the user navigates away, **Then** the note list reflects the updated note.

---

### Edge Cases

- What happens if auto-save fails mid-edit (network error while user is still typing)?
- How does the editor handle very large note content (performance)?
- What happens if image insertion fails (network error, unsupported format)?
- What happens if the user tries to undo with no history available?
- What is displayed as the note title in lists if the note content is empty or the first line is blank?
- How does the tag selector behave if no tags exist for the notebook?
- What happens when the note fails to save (network error)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The create note action MUST navigate the user to a dedicated full-screen page with its own route (e.g., `/notebooks/:notebookId/notes/create`).
- **FR-002**: The edit note action MUST navigate the user to a dedicated full-screen page with its own route (e.g., `/notebooks/:notebookId/notes/:noteId/edit`).
- **FR-003**: Both create and edit pages MUST use a markdown editor as the sole content input area; there is no separate title field — the first line of the markdown content is used as the note's display title.
- **FR-004**: The markdown editor MUST support the following formatting actions: bold, italic, underline, inline code format, numbered list, checklist, insert image, undo, redo.
- **FR-005**: The formatting toolbar MUST be positioned at the bottom of the editor page.
- **FR-006**: The tag selector MUST be visible and accessible at the top of the editor page.
- **FR-007**: The note creation date MUST be displayed at the top of the editor page.
- **FR-008**: The "insert image" action MUST allow users to select an image from their device and embed it inline at the cursor position within the markdown content (not as a separate attachment list).
- **FR-009**: The editor MUST automatically persist note content (including markdown formatting) using debounced auto-save; no explicit save button is required.
- **FR-010**: The existing `CreateNotePopup` (bottom sheet) MUST be replaced by the new full-screen create route.
- **FR-013**: When an existing note is opened in the editor, the note's `title` field value MUST be loaded as the markdown content; the backend field rename is out of scope for this feature.
- **FR-014**: When saving a note (create or edit), the frontend MUST write the markdown content to the existing `title` API field; no new API fields are introduced in this feature.
- **FR-011**: The existing inline edit experience in `NoteDetailPage` MUST be replaced by the new full-screen edit route.
- **FR-012**: Users MUST be able to navigate back from the editor pages to the notebook detail page.

### Key Entities

- **Note**: Represents a user's note with a markdown body content (the first line serves as the display title), creation date, associated tags, and inline image attachments.
- **Tag**: Notebook-scoped label that can be assigned to notes; displayed as a chip with icon and title.
- **Attachment/Image**: Image embedded inline within a note's markdown body at a user-chosen position; uploaded and stored remotely, referenced via URL in the markdown.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can open the create note page, write formatted content, and save a note in under 60 seconds.
- **SC-002**: Users can open an existing note for editing, make changes, and save in under 30 seconds from the edit page load.
- **SC-003**: All 9 formatting toolbar actions (bold, italic, underline, inline code, numbered list, checklist, insert image, undo, redo) are accessible and functional from the bottom toolbar.
- **SC-004**: Tag selection at the top of the editor page takes no more than 2 taps to complete.
- **SC-005**: 100% of notes created or edited via the new editor correctly persist their markdown content and tags after saving.
- **SC-006**: The create note popup (sheet) is fully removed and no longer accessible to users.

## Assumptions

- The existing tag data model and API remain unchanged; only the UI surface for tag selection is relocated.
- The note body previously stored plain text or a simple format; the new markdown format will be stored as-is (markdown string) via the existing notes API.
- Images are embedded inline at cursor position in the markdown body; the existing image upload mechanism is reused and the resulting remote URL is inserted as a markdown image reference.
- The creation date displayed at the top is the note's original creation timestamp (read-only on the edit page; auto-generated on the create page).
- Note content is saved automatically using debounced auto-save (no explicit save button); navigating back triggers a final save flush before leaving the page.
- The app is mobile-first (Framework7); the full-screen editor occupies the entire viewport.
- There is no separate title field; the note's display title is derived from the first line of its markdown content. Note cards and lists display this first line as the title.
- For existing notes, the stored title value is treated as the note's content on the frontend; the backend field rename/migration is out of scope for this feature and will be addressed separately.
