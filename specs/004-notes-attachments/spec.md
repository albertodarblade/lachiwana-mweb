# Feature Specification: Notes & Attachments

**Feature Branch**: `004-notes-attachments`
**Created**: 2026-05-01
**Status**: Draft
**Input**: User description: "the BE has new endpoints, the user should be able to create, edit and delete notes, and upload files or attachments throw those API, (edit notes should be debounce to use the mutation) should be handled on each onChange of the fields, delete should have its own confirmation like deletenotebooks, the user should be able to attach images on create note form, and add or delete files on edit notes, the user shoul be able to see all the files of the attachments in galery mode, use framework7 react components, in case a file is not an img create a placeholder and a download button."

## Clarifications

### Session 2026-05-01

- Q: Should the note detail (view/edit/attachments) open as a dedicated route or as a sheet/overlay? → A: Dedicated route `/notebooks/:id/notes/:noteId` — same pattern as the rest of the app.

### Session 2026-05-02

- Q: When the user submits the creation form with images queued, when does navigation to the new note's detail page happen — immediately after note creation (images upload in background on detail page) or only after all uploads complete? → A: Only after all image uploads complete; the creation form shows a loading state on the submit button during uploads.
- Q: If the note is created successfully but one or more image uploads fail during the creation flow, what should happen? → A: Navigate to the note detail page regardless; show a toast error for each failed upload. The note exists on the server without the failed images.
- Q: What should the notes area of NotebookDetailPage show while the notes list is loading (before useNotes returns)? → A: A centered F7 Preloader spinner in the notes area.
- Q: What should the title field in NoteDetailPage show while useNote is fetching? → A: Pre-populate immediately from the ['notes', notebookId] list cache (initialData); update silently once the detail query resolves.
- Q: Where does the delete action appear on NoteDetailPage? → A: "More options" overflow menu (⋮) in the Navbar right slot; delete is one of the menu items.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Notes List in Notebook (Priority: P1)

An authenticated user navigates to a notebook detail page. Instead of the static "Notas
vacías" placeholder, they see a scrollable list of notes belonging to that notebook. When
no notes exist yet, an empty-state message prompts the user to create the first note. A
prominent action button is always visible to create a new note.

**Why this priority**: Notes are the core content of a notebook. The list view is the
entry point for all note interactions and replaces the existing placeholder.

**Independent Test**: Open a notebook detail → notes list renders with existing notes →
empty state shown for notebooks with no notes → "Nueva Nota" action button always visible.

**Acceptance Scenarios**:

1. **Given** a notebook with notes, **When** the detail page loads, **Then** a scrollable
   list of note cards is displayed, each showing the note's title and attachment count.
2. **Given** a notebook with no notes, **When** the detail page loads, **Then** an
   empty-state message is shown instead of the list.
3. **Given** the notebook detail page, **When** the user views it, **Then** a "Nueva
   Nota" action button is always visible regardless of note count.

---

### User Story 2 - Create a Note (Priority: P2)

An authenticated user taps "Nueva Nota", is taken to a creation form with a title field
and an optional image attachment area. After submitting, the note is created and the user
is taken to the new note's detail page.

**Why this priority**: Creating notes is the primary write action for this feature.

**Independent Test**: Tap "Nueva Nota" → creation form renders → enter title → attach
an image (optional) → submit → navigate to the new note's detail page → note appears
in the notebook's list.

**Acceptance Scenarios**:

1. **Given** the notebook detail page, **When** the user taps "Nueva Nota", **Then** a
   note creation form is displayed with a required title field and an image attachment
   area.
2. **Given** the creation form, **When** the user submits with a valid title, **Then**
   the note is created on the server, any queued image uploads complete sequentially
   while the submit button shows a loading state, and the user is navigated to the
   note detail page only after all uploads have finished.
3. **Given** the creation form, **When** the user submits with an empty title, **Then**
   submission is blocked with a validation message.
4. **Given** the creation form, **When** the user attaches one or more images before
   submitting, **Then** those images are uploaded sequentially after note creation
   while the submit button remains in a loading state, and navigation does not occur
   until all uploads are complete.

---

### User Story 3 - Edit Note Title (Auto-Save) (Priority: P3)

An authenticated user opens a note's detail page and edits the title directly in place.
Changes are saved automatically after the user stops typing, without requiring an explicit
save action. A subtle saving indicator appears while the save is in progress.

**Why this priority**: Auto-save eliminates friction for the primary write action on
notes (editing title) and prevents accidental data loss.

**Independent Test**: Open a note → edit the title → stop typing → saving indicator
appears → indicator disappears → navigate back → note card shows updated title.

**Acceptance Scenarios**:

1. **Given** the note detail page, **When** the user edits the title and pauses, **Then**
   the change is saved automatically without the user tapping a save button.
2. **Given** the title is being auto-saved, **When** the save is in progress, **Then**
   a saving indicator is visible to the user.
3. **Given** an auto-save that fails, **When** the error occurs, **Then** a toast error
   appears at the top of the view and the field retains the unsaved value.
4. **Given** the note title updated via auto-save, **When** the user navigates back to
   the notes list, **Then** the note card shows the updated title.

---

### User Story 4 - Manage Attachments (Priority: P4)

An authenticated user opens a note's detail page and sees all its attachments displayed
in a gallery. Images render as thumbnails and can be viewed fullscreen. Non-image files
show a file placeholder with a download button. The user can upload new files (any file
type) and delete existing attachments individually.

**Why this priority**: Attachments are a key differentiating capability of this notes
system; the gallery and file management are central to the user's workflow.

**Independent Test**: Open a note with mixed attachments (images + non-images) → gallery
renders thumbnails for images and placeholder + download button for other files → tap
an image → fullscreen view opens → upload a new file → file appears in gallery → delete
an attachment → it disappears from the gallery.

**Acceptance Scenarios**:

1. **Given** a note with image attachments, **When** the detail page loads, **Then**
   images are displayed as thumbnails in a gallery grid.
2. **Given** a note with non-image attachments, **When** the detail page loads, **Then**
   each non-image file shows a file-type placeholder icon and a download button.
3. **Given** the gallery, **When** the user taps an image thumbnail, **Then** the image
   opens in a fullscreen viewer with swipe-to-dismiss.
4. **Given** the note detail page, **When** the user taps "Agregar archivo", **Then** a
   file picker opens allowing selection of any file type.
5. **Given** a file selected for upload, **When** the upload completes, **Then** the new
   file appears in the gallery immediately.
6. **Given** an attachment in the gallery, **When** the user taps its delete control,
   **Then** a confirmation is requested before the attachment is removed.
7. **Given** the user confirms deletion of an attachment, **When** the server confirms,
   **Then** the attachment disappears from the gallery.
8. **Given** a non-image attachment, **When** the user taps its download button, **Then**
   the file is downloaded to the device.

---

### User Story 5 - Delete a Note (Priority: P5)

An authenticated user opens a note's detail page and chooses to delete the note. A
confirmation dialog with a 5-second countdown is shown (identical to the notebook delete
pattern). After confirming and receiving server success, the user is navigated back to
the notebook detail page and the note is no longer in the list.

**Why this priority**: Deletion is a destructive action that must be intentional and
protected from accidental execution.

**Independent Test**: Open a note → tap ⋮ overflow menu → tap "Eliminar nota" →
confirmation dialog with countdown opens → wait 5 seconds → confirm → navigate back
to notebook → note is gone from list.

**Acceptance Scenarios**:

1. **Given** the note detail page, **When** the user opens the ⋮ overflow menu in the
   Navbar and taps "Eliminar nota", **Then** a confirmation dialog opens with the
   confirm button disabled and a 5-second countdown.
2. **Given** the confirmation dialog after countdown completes, **When** the user
   confirms, **Then** the note and all its attachments are deleted on the server and the
   user is navigated back to the notebook detail page.
3. **Given** a deletion that fails, **When** the error is received, **Then** a toast
   error is shown and the dialog remains open for retry.
4. **Given** the confirmation dialog, **When** the user cancels, **Then** no action is
   taken and the note detail page remains.

---

### Edge Cases

- What if one or more image uploads fail after note creation during the creation flow?
  The note already exists on the server. The app navigates to the note detail page
  regardless and shows a toast error for each failed upload. Failed images are not
  retried automatically; the user can upload them manually from the note detail page.
- What if the upload fails midway on the note detail page? The partially uploaded file
  is not added to the gallery; a toast error informs the user and the upload control
  returns to its idle state.
- What if the note list fails to load? An error state with a retry option is shown in the
  notes area.
- What if the auto-save fails and the user immediately navigates away? The unsaved change
  is lost; the note reverts to the last successfully saved title.
- What if a non-image file is too large to download on mobile? The browser handles the
  download natively; no additional size validation is required by the app.
- What if an image fails to load in the gallery? A broken-image placeholder is shown for
  that thumbnail.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The notebook detail page MUST replace the "Notas vacías" static placeholder
  with a dynamic notes list and a "Nueva Nota" action button.
- **FR-002**: The notes list MUST display each note as a card showing its title and the
  count of its attachments.
- **FR-003**: When a notebook has no notes, an empty-state message MUST be displayed in
  place of the list.
- **FR-004**: Tapping "Nueva Nota" MUST navigate to a note creation page with a required
  title field and an optional image attachment area.
- **FR-005**: Submitting the creation form MUST create the note on the server, then
  sequentially upload any selected images while the submit button shows a loading state,
  and navigate to the newly created note's detail page at
  `/notebooks/:notebookId/notes/:noteId` only after all uploads have completed.
- **FR-006**: The note creation form MUST block submission when the title is empty and
  show a validation message.
- **FR-007**: The note detail page MUST display the note title as an editable field that
  saves automatically after the user pauses typing, without a separate save button.
- **FR-008**: While an auto-save is in progress, the note detail page MUST display a
  saving indicator.
- **FR-009**: If an auto-save fails, a toast error MUST appear at the top of the note
  detail page.
- **FR-010**: The note detail page MUST display all attachments in a gallery layout:
  images as thumbnails, non-image files as a file-type placeholder with a download
  button.
- **FR-011**: Tapping an image thumbnail MUST open it in a fullscreen viewer with
  swipe navigation between images.
- **FR-012**: The note detail page MUST include an "Agregar archivo" control that opens
  the device file picker for uploading any file type.
- **FR-013**: After a successful file upload, the new attachment MUST appear in the
  gallery immediately.
- **FR-014**: Each attachment MUST have an individual delete control; tapping it MUST
  request confirmation before removing the attachment.
- **FR-015**: The note detail page MUST include a delete action for the note that opens
  a confirmation dialog with a 5-second countdown before enabling confirmation (identical
  pattern to notebook delete).
- **FR-016**: Confirming note deletion MUST delete the note and all its attachments on
  the server and navigate back to the notebook detail page at `/notebooks/:notebookId`.
- **FR-017**: While the notes list is loading in NotebookDetailPage, a centered F7
  Preloader spinner MUST be displayed in the notes area in place of the list or
  empty-state.
- **FR-018**: The note detail page title field MUST be pre-populated immediately on
  mount using the note's title from the `['notes', notebookId]` list cache as
  `initialData` for `useNote`, so the field is never blank while the detail query is
  in flight. The field MUST update silently once the detail query resolves.
- **FR-019**: The note detail page Navbar MUST include a ⋮ overflow menu button in the
  right slot. The menu MUST contain at minimum an "Eliminar nota" item that opens the
  5-second countdown confirmation dialog.

### Key Entities

- **Note**: A titled document within a notebook. Attributes: `id`, `title`, `attachments`
  (array), `createdAt`, `updatedAt`.
- **Attachment**: A file associated with a note. Attributes: `id`, `uploadedBy` (name +
  avatar URL), `uploadedDate`, `fileSrcId` (unique file reference used to retrieve the
  file content from the backend).
- **File type determination**: The app determines whether an attachment is an image by
  attempting to load its content URL as an image. If loading fails, it is treated as a
  non-image file.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The notes list for a notebook renders within 1 second of the notebook
  detail page loading.
- **SC-002**: A user can complete the full note creation flow (tap "Nueva Nota" → enter
  title → submit) in under 30 seconds.
- **SC-003**: Auto-save triggers within 1 second of the user pausing after the last
  keystroke, and the saving indicator appears immediately when saving begins.
- **SC-004**: A file upload completes and the attachment appears in the gallery within
  5 seconds for files under 10 MB on a standard mobile connection.
- **SC-005**: The gallery loads and all existing attachment thumbnails are visible within
  2 seconds of the note detail page opening.

## Assumptions

- Notes are displayed in reverse-chronological order by `createdAt` on the notes list (newest first).
- The note creation form only supports uploading images (not arbitrary files); arbitrary
  file uploads are available on the edit/detail page only.
- A note's only editable text field is `title`; there is no freeform body/content field
  in this feature (no backend support for it).
- The file content endpoint (`GET /api/v1/files/:fileSrcId`) streams binary content with
  the appropriate `Content-Type` header and requires authentication. Because browsers do
  not send auth headers with native `<img src>` requests, the app must fetch file content
  through the authenticated API layer and render it using in-memory blob URLs.
- File type (image vs non-image) is determined from the `Content-Type` header returned
  by the file endpoint at fetch time; no type metadata is stored in the attachment record.
- Image fullscreen view supports swipe-to-navigate between all images in the note's
  gallery.
- Attachment deletion confirmation does NOT use a countdown timer — a simple confirm/
  cancel dialog is sufficient (unlike note/notebook deletion which uses the 5-second
  countdown, as those operations also delete child resources).
- The note detail page serves as both the viewer and editor; there is no separate "view
  mode" and "edit mode".
- Uploading a file shows a loading state on the upload control while the request is
  in flight.
