import React, { useRef, useMemo, useState, createContext, useContext, useCallback } from 'react'
import { f7, Preloader } from 'framework7-react'
import {
  MDXEditor,
  toolbarPlugin,
  listsPlugin,
  imagePlugin,
  insertImage$,
  BoldItalicUnderlineToggles,
  CodeToggle,
  ListsToggle,
  UndoRedo,
  usePublisher,
} from '@mdxeditor/editor'
import { getBlob } from '../../api/client'
import queryClient from '../../queryClient'
import styles from './NoteEditor.module.css'

const UploadContext = createContext({ uploadImage: null, isUploading: false })

const BROKEN_IMAGE_MARKER = 'imgLoadError'
const TRANSPARENT_GIF_MARKER = 'R0lGODlh'

// Maps resolved data URL → original fileSrcId for reverse lookup when tapping an image
const dataUrlToFileSrcId = new Map()

async function imagePreviewHandler(fileSrcId) {
  try {
    const dataUrl = await queryClient.fetchQuery({
      queryKey: ['file', fileSrcId],
      queryFn: async () => {
        const blob = await getBlob(`/api/v1/files/${fileSrcId}`)
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        })
      },
      staleTime: Infinity,
    })
    dataUrlToFileSrcId.set(dataUrl, fileSrcId)
    return dataUrl
  } catch {
    return fileSrcId
  }
}

function ImageLoadingPlaceholder() {
  return (
    <div className="note-editor-image-placeholder">
      <Preloader size={24} />
    </div>
  )
}

const EmptyEditToolbar = () => null

function InsertImageButton() {
  const { uploadImage, isUploading } = useContext(UploadContext)
  const insertImage = usePublisher(insertImage$)
  const fileInputRef = useRef(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !uploadImage) return
    const src = await uploadImage(file)
    if (src) insertImage({ src, altText: '' })
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className={styles.fileInput}
        onChange={handleFileChange}
      />
      <button
        type="button"
        title="Insert image"
        disabled={isUploading}
        className={['mdxeditor-toolbar-button', isUploading ? styles.insertImageButtonUploading : styles.insertImageButton].join(' ')}
        onClick={() => fileInputRef.current?.click()}
      >
        <i className={['f7-icons', styles.buttonIcon].join(' ')}>photo</i>
      </button>
    </>
  )
}

const toolbarContents = () => (
  <>
    <BoldItalicUnderlineToggles />
    <CodeToggle />
    <ListsToggle options={['number', 'check']} />
    <InsertImageButton />
    <UndoRedo />
  </>
)

function buildNavbar() {
  // Use <span> (not <a>) to avoid F7's global router click handler swallowing the tap.
  return `
    <div class="navbar navbar-photo-browser">
      <div class="navbar-bg"></div>
      <div class="navbar-inner">
        <div class="left">
          <span class="link pb-delete-btn" style="cursor:pointer">
            <i class="f7-icons" style="color:#ff3b30;font-size:22px">trash</i>
          </span>
        </div>
        <div class="right">
          <a class="link popup-close" data-popup=".photo-browser-popup">
            <i class="icon icon-close"></i>
          </a>
        </div>
      </div>
    </div>
  `
}

export default function NoteEditor({
  initialContent,
  onContentChange,
  imageUploadHandler,
  onDeleteImage,
  notebookColor,
  placeholder = 'Start writing...',
  autoFocus = false,
}) {
  const uploadHandlerRef = useRef(imageUploadHandler)
  uploadHandlerRef.current = imageUploadHandler

  const onDeleteImageRef = useRef(onDeleteImage)
  onDeleteImageRef.current = onDeleteImage

  const onContentChangeRef = useRef(onContentChange)
  onContentChangeRef.current = onContentChange

  const [isUploading, setIsUploading] = useState(false)
  const mdxEditorRef = useRef()

  const uploadImage = useCallback(async (file) => {
    setIsUploading(true)
    f7.preloader.show()
    try {
      return await uploadHandlerRef.current(file)
    } catch {
      return null
    } finally {
      setIsUploading(false)
      f7.preloader.hide()
    }
  }, [])

  const contextValue = useMemo(() => ({ uploadImage, isUploading }), [uploadImage, isUploading])

  const plugins = useMemo(() => [
    listsPlugin(),
    imagePlugin({
      imageUploadHandler: (file) => uploadHandlerRef.current(file),
      imagePreviewHandler,
      imagePlaceholder: ImageLoadingPlaceholder,
      EditImageToolbar: EmptyEditToolbar,
      disableImageResize: true,
    }),
    toolbarPlugin({
      toolbarPosition: 'bottom',
      toolbarContents,
    }),
  ], [])

  function handleEditorClick(e) {
    const img = e.target.closest('img')
    if (!img || !img.closest('.mdxeditor-root-contenteditable')) return
    const src = img.getAttribute('src')
    if (!src || src.includes(BROKEN_IMAGE_MARKER) || src.includes(TRANSPARENT_GIF_MARKER)) return
    const fileSrcId = dataUrlToFileSrcId.get(src) ?? src

    const pb = f7.photoBrowser.create({
      photos: [{ url: src }],
      type: 'standalone',
      navbar: true,
      toolbar: false,
      navbarShowCount: false,
      renderNavbar: buildNavbar,
    })

    // Use document-level delegation after 'opened' (animation done, DOM settled).
    // Avoids F7 router interference and pb.$el timing issues.
    function onDeleteClick(ev) {
      if (!ev.target.closest('.pb-delete-btn')) return
      ev.stopPropagation()
      f7.dialog.confirm(
        '¿Eliminar esta imagen? Esta acción no se puede deshacer.',
        '¿Eliminar imagen?',
        async () => {
          // 1. Strip the image node from the editor markdown
          const current = mdxEditorRef.current?.getMarkdown() ?? ''
          const escaped = fileSrcId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          const updated = current.replace(
            new RegExp(`!\\[[^\\]]*\\]\\(${escaped}[^)]*\\)\\n?`, 'g'),
            ''
          )
          mdxEditorRef.current?.setMarkdown(updated)
          // setMarkdown does NOT fire onChange — call it explicitly so the
          // debounced note-patch runs and the content is persisted.
          onContentChangeRef.current?.(updated)

          // 2. Delete the attachment via the backend API
          if (onDeleteImageRef.current) await onDeleteImageRef.current(fileSrcId)

          // 3. Clean up local caches and close the gallery
          dataUrlToFileSrcId.delete(src)
          queryClient.removeQueries({ queryKey: ['file', fileSrcId] })
          pb.close()
        }
      )
    }

    pb.on('opened', () => document.addEventListener('click', onDeleteClick))
    pb.on('closed', () => {
      document.removeEventListener('click', onDeleteClick)
      pb.destroy()
    })
    pb.open()
  }

  return (
    <UploadContext.Provider value={contextValue}>
      <div
        className="note-editor-root"
        style={notebookColor ? { '--notebook-color': notebookColor } : undefined}
        onClick={handleEditorClick}
      >
        <MDXEditor
          ref={mdxEditorRef}
          markdown={initialContent || ''}
          placeholder={placeholder}
          autoFocus={autoFocus}
          onChange={onContentChange}
          plugins={plugins}
        />
      </div>
    </UploadContext.Provider>
  )
}
