import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { EditorView, basicSetup } from 'codemirror'
import { EditorState } from '@codemirror/state'
import { html as htmlLang } from '@codemirror/lang-html'
import { Eye } from 'lucide-react'
import { toPreviewDoc } from '../../utils/sandboxCode'
import styles from './SmartNoteEditor.module.css'

const editorTheme = EditorView.theme({
  '&': { height: '100%' },
  '.cm-scroller': {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
    fontSize: '14px',
    lineHeight: '1.55',
    paddingBottom: '48px',
  },
  '.cm-content': { padding: '12px' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    borderRight: '1px solid rgba(0, 0, 0, 0.06)',
    color: 'rgba(0, 0, 0, 0.3)',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: 'var(--notebook-color, #007aff)',
    borderLeftWidth: '2px',
  },
})

export default function SmartNoteEditor({
  initialTitle = '',
  initialCode = '',
  onTitleChange,
  onCodeChange,
  previewOpen = false,
  onPreviewChange,
  notebookColor,
  autoFocus = false,
}) {
  // Existing code → open in preview first; only an empty sandbox starts in edit mode.
  const hasInitialCode = Boolean(initialCode.trim())

  const [title, setTitle] = useState(initialTitle)
  const [previewDoc, setPreviewDoc] = useState(() => (hasInitialCode ? toPreviewDoc(initialCode) : ''))

  const hostRef = useRef(null)
  const viewRef = useRef(null)
  const codeRef = useRef(initialCode)
  const onCodeChangeRef = useRef(onCodeChange)
  onCodeChangeRef.current = onCodeChange
  const onPreviewChangeRef = useRef(onPreviewChange)
  onPreviewChangeRef.current = onPreviewChange

  // Report the initial mode before paint: the navbar swaps SaveStatus → Editar
  // in the same frame, so there's no edit-mode flash on notes with code.
  useLayoutEffect(() => {
    onPreviewChangeRef.current?.(hasInitialCode)
  }, [])

  function handleDocUpdate(update) {
    if (!update.docChanged) return
    codeRef.current = update.state.doc.toString()
    onCodeChangeRef.current?.(codeRef.current)
  }

  useEffect(() => {
    const view = new EditorView({
      state: EditorState.create({
        doc: initialCode,
        extensions: [
          basicSetup,
          EditorView.lineWrapping,
          // HTML mode: also highlights embedded <style> and <script> blocks.
          htmlLang(),
          editorTheme,
          EditorView.updateListener.of(handleDocUpdate),
        ],
      }),
      parent: hostRef.current,
    })
    viewRef.current = view
    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [])

  function handleTitleChange(e) {
    const value = e.target.value
    setTitle(value)
    onTitleChange?.(value)
  }

  function togglePreview() {
    if (!previewOpen) setPreviewDoc(toPreviewDoc(codeRef.current))
    onPreviewChangeRef.current?.(!previewOpen)
  }

  const toolbarEl = (
    <div className={styles.toolbar}>
      <button
        type="button"
        className={styles.previewBtn}
        onClick={togglePreview}
        data-testid="smart-preview-toggle"
      >
        <Eye size={16} />
        Vista previa
      </button>
    </div>
  )

  return (
    <div
      className={styles.root}
      style={notebookColor ? { '--notebook-color': notebookColor } : undefined}
    >
      {!previewOpen && (
        <input
          className={styles.titleInput}
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Título de la nota"
          spellCheck={false}
          autoFocus={autoFocus}
          data-testid="smart-note-title"
        />
      )}
      {!previewOpen && toolbarEl}
      {/* Stable slot so the CodeMirror host never unmounts across mode switches */}
      <div className={styles.editorArea}>
        <div
          ref={hostRef}
          className={previewOpen ? styles.editorHostHidden : styles.editorHost}
        />
      </div>
      {/* Full-layout overlay: covers title, tags row and toolbar — preview is immersive.
          "Editar" lives in the navbar, replacing the note's save status. */}
      {previewOpen && (
        <div className={styles.previewOverlay}>
          <iframe
            className={styles.previewFrame}
            title="Vista previa de la Smart Note"
            sandbox="allow-scripts"
            srcDoc={previewDoc}
            data-testid="smart-preview-frame"
          />
        </div>
      )}
    </div>
  )
}
