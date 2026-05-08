# Research: Note Editor Refactor

**Branch**: `009-note-editor-refactor` | **Date**: 2026-05-04

## Decision 1: MDXEditor Package

**Decision**: Use `@mdxeditor/editor` v3.x (latest stable ~3.54.0)

**Rationale**: Only package required by name in the spec. Actively maintained, plugin-based architecture maps cleanly to the 9 required toolbar actions.

**Alternatives considered**: None — MDXEditor was specified directly.

**Risk — React 19 compatibility**: MDXEditor has reported compatibility issues with React 19 (`Cannot read properties of null (reading 'useContext')`). GitHub issue #494 tracks this. **Verification required**: install and smoke-test `@mdxeditor/editor` against React 19.2.5 before committing to implementation. If incompatible, options are: (a) pin `@mdxeditor/editor` to a React 18-compatible build using a React 18 compat shim (unlikely), or (b) await a patch release. As of May 2026 the latest 3.x may have resolved this — confirm at install time.

---

## Decision 2: Required Plugins

| Toolbar Action | Plugin | Toolbar Component |
|----------------|--------|-------------------|
| Bold, Italic, Underline | _(built-in, no extra plugin)_ | `BoldItalicUnderlineToggles` |
| Inline code | _(built-in)_ | `CodeToggle` |
| Numbered list | `listsPlugin()` | `ListsToggle` (type `number`) |
| Checklist | `listsPlugin()` | `ListsToggle` (type `check`) |
| Insert image | `imagePlugin({ imageUploadHandler })` | `InsertImage` |
| Undo / Redo | _(built-in)_ | `UndoRedo` |

**Minimum plugin set**: `listsPlugin()`, `imagePlugin({ imageUploadHandler })`, `toolbarPlugin({ toolbarContents, toolbarClassName })`

**Rationale**: Keeps the bundle minimal — only two data plugins needed. All other actions are toolbar components wired to MDXEditor's built-in Lexical commands.

---

## Decision 3: Toolbar Bottom Positioning

**Decision**: Use `toolbarPlugin({ toolbarClassName: 'note-editor-bottom-toolbar' })` and apply `position: fixed; bottom: 0` via scoped CSS.

**Rationale**: MDXEditor renders the toolbar as `<div className="mdxeditor-toolbar {toolbarClassName}">`. Overriding position with a custom class is the least-invasive approach — no hacks into Lexical internals, no separate toolbar DOM tree, no duplicate command wiring.

**Implementation detail**: The `Page` content area must add `padding-bottom` equal to the toolbar height to prevent content being hidden behind the fixed bar. Framework7's `Toolbar` component is NOT used here — the MDXEditor toolbar must remain coupled to the editor's internal Lexical state.

**Alternatives considered**:
- *Custom F7 Toolbar + Lexical `FORMAT_TEXT_COMMAND`*: Would give full design control but requires importing Lexical internals (`@lexical/react`) and re-implementing every command dispatch — high complexity, fragile coupling to MDXEditor internals.
- *CSS `flex-direction: column-reverse`*: Causes accessibility/tab-order issues on mobile.

---

## Decision 4: Image Upload Handler

**Decision**: Implement `imageUploadHandler` as an async function that:
1. Calls `prepareFileForUpload(file)` (existing utility — applies browser-image-compression)
2. Wraps result in `FormData` and calls `uploadAttachment(notebookId, noteId, formData)`
3. Returns the remote URL from the API response

**Markdown output**: MDXEditor's imagePlugin inserts `![](url)` at cursor position.

**Dependency**: `noteId` must exist before any image can be uploaded. See Decision 5.

---

## Decision 5: Note Creation Timing (Create Page)

**Decision**: Create the note **eagerly** when `CreateNoteEditorPage` mounts (empty title, no tags). Store the returned `noteId` in component state. Auto-save and image upload both use this ID.

**Rationale**: Avoids the complexity of queueing image uploads while note creation is pending. The simplest approach that satisfies FR-008 (inline image insertion on the create page).

**Trade-off**: If the user opens the create page and immediately navigates back without typing anything, an empty note is left in the notebook. Mitigation: on unmount, if the note was never edited (content is empty), delete it.

**Alternatives considered**:
- *Deferred creation (on first keystroke)*: Clean but requires queueing image uploads and showing a loading state before images can be inserted — poor UX on mobile.
- *Block image insertion until first save*: Simpler but violates FR-008 (image insert must be available from the toolbar at all times).

---

## Decision 6: NoteDetailPage Fate

**Decision**: The `/notebooks/:notebookId/notes/:noteId` route is **repurposed** to render `NoteEditorPage` (the new editor). `NoteDetailPage.jsx` is replaced. Delete functionality moves to an Actions menu within `NoteEditorPage`.

**Rationale**: Users expect tapping a note to open it for editing immediately. Adding a separate `/edit` sub-route would require two taps to start editing. The spec's "e.g." in the route name confirms flexibility.

**Files retired**: `CreateNotePopup.jsx` (replaced by route), `NoteDetailPage.jsx` (replaced by `NoteEditorPage.jsx`).
