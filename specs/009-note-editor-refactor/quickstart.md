# Quickstart: Note Editor Refactor

**Branch**: `009-note-editor-refactor`

## Install dependency

```bash
pnpm add @mdxeditor/editor
```

> Smoke-test React 19 compatibility immediately after install:
> `pnpm dev` → open any note → confirm no console errors re: `useContext`.

## CSS import

Add to `src/main.jsx` (or the entry CSS file):

```js
import '@mdxeditor/editor/style.css'
```

## Verify toolbar bottom positioning

After installing, check that the custom class override works in dev:

```jsx
// In NoteEditor.jsx
toolbarPlugin({
  toolbarClassName: 'note-editor-bottom-toolbar',
  toolbarContents: () => (/* toolbar items */)
})
```

```css
/* In src/styles/note-editor.css */
.note-editor-bottom-toolbar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 500;
  border-top: 1px solid var(--f7-list-item-border-color);
  border-bottom: none;
  background: var(--f7-page-bg-color);
}
```

## New routes to register in App.jsx

```jsx
import CreateNoteEditorPage from './pages/CreateNoteEditorPage'
import NoteEditorPage from './pages/NoteEditorPage'

// Replace existing NoteDetail route:
{ path: '/notebooks/:notebookId/notes/create', component: ProtectedCreateNoteEditor },
{ path: '/notebooks/:notebookId/notes/:noteId', component: ProtectedNoteEditor },
```

## Retired files (delete after migration)

- `src/components/notes/CreateNotePopup.jsx`
- `src/pages/NoteDetailPage.jsx`
