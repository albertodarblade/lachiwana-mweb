import React, { useRef } from 'react'
import { Block, Button, PhotoBrowser } from 'framework7-react'
import { useUploadAttachment } from '../../hooks/useUploadAttachment'
import { useBlobUrl } from '../../hooks/useBlobUrl'
import AttachmentItem from './AttachmentItem'
import queryClient from '../../queryClient'

function ImagePhotos({ attachments }) {
  return attachments
    .filter((a) => {
      const cached = queryClient.getQueryData(['file', a.fileSrcId])
      return cached?.isImage
    })
    .map((a) => {
      const cached = queryClient.getQueryData(['file', a.fileSrcId])
      return { url: cached?.dataUrl ?? '' }
    })
}

export default function AttachmentGallery({ notebookId, noteId, attachments }) {
  const photoBrowserRef = useRef(null)
  const fileInputRef = useRef(null)
  const { mutate: upload, isPending: isUploading } = useUploadAttachment(notebookId, noteId)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    upload(formData)
    e.target.value = ''
  }

  // Build image list from cached blob data for PhotoBrowser
  const imagePhotos = (attachments ?? []).reduce((acc, att) => {
    const cached = queryClient.getQueryData(['file', att.fileSrcId])
    if (cached?.isImage) acc.push({ url: cached.dataUrl, id: att.id })
    return acc
  }, [])

  function handleImageTap(attachment) {
    const index = imagePhotos.findIndex((p) => p.id === attachment.id)
    if (index !== -1 && photoBrowserRef.current) {
      photoBrowserRef.current.open(index)
    }
  }

  return (
    <Block>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <strong style={{ fontSize: '14px' }}>Archivos adjuntos</strong>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button small onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
            <i className="f7-icons" style={{ marginRight: '4px' }}>paperclip</i>
            {isUploading ? 'Subiendo...' : 'Agregar archivo'}
          </Button>
        </div>
      </div>

      {(!attachments || attachments.length === 0) && (
        <p style={{ opacity: 0.5, fontSize: '13px', margin: 0 }}>Sin archivos adjuntos</p>
      )}

      {(attachments ?? []).map((att) => (
        <AttachmentItem
          key={att.id}
          attachment={att}
          notebookId={notebookId}
          noteId={noteId}
          onImageTap={() => handleImageTap(att)}
        />
      ))}

      <PhotoBrowser
        ref={photoBrowserRef}
        photos={imagePhotos}
        theme="dark"
        type="popup"
      />
    </Block>
  )
}
