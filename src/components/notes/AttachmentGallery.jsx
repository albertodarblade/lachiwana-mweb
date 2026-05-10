import React, { useRef } from 'react'
import { Paperclip } from 'lucide-react'
import { Block, Button, PhotoBrowser, f7 } from 'framework7-react'
import { useQueries } from '@tanstack/react-query'
import { useUploadAttachment } from '../../hooks/useUploadAttachment'
import { getBlob } from '../../api/client'
import AttachmentItem from './AttachmentItem'
import { prepareFileForUpload } from '../../utils/compressImage'
import styles from './AttachmentGallery.module.css'

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ dataUrl: reader.result, mimeType: blob.type, isImage: blob.type.startsWith('image/') })
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function AttachmentGallery({ notebookId, noteId, attachments }) {
  const photoBrowserRef = useRef(null)
  const fileInputRef = useRef(null)
  const { mutate: upload, isPending: isUploading } = useUploadAttachment(notebookId, noteId)

  // Identify image attachments upfront from mimeType — no fetch needed
  const imageAttachments = (attachments ?? []).filter(a => a.mimeType?.startsWith('image/'))

  // Subscribe to blob URLs for all images so PhotoBrowser.photos stays reactive.
  // Same queryKey as useBlobUrl → TanStack Query deduplicates fetches with AttachmentItem.
  const blobQueries = useQueries({
    queries: imageAttachments.map(att => ({
      queryKey: ['file', att.fileSrcId],
      queryFn: async () => {
        const blob = await getBlob(`/api/v1/files/${att.fileSrcId}`)
        return blobToDataUrl(blob)
      },
      staleTime: Infinity,
      enabled: !!att.fileSrcId,
    })),
  })

  const imagePhotos = blobQueries.map(q => ({ url: q.data?.dataUrl ?? '' }))

  function handleImageTap(attachment) {
    const index = imageAttachments.findIndex(a => a.id === attachment.id)
    if (index !== -1 && photoBrowserRef.current) {
      photoBrowserRef.current.open(index)
    }
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    let prepared
    try {
      prepared = await prepareFileForUpload(file)
    } catch (err) {
      f7.toast.create({ text: err.message, closeTimeout: 3500, position: 'top' }).open()
      return
    }

    const formData = new FormData()
    formData.append('file', prepared, file.name)
    upload(formData)
  }

  return (
    <Block>
      <div className={styles.header}>
        <strong className={styles.headerTitle}>Archivos adjuntos</strong>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            className={styles.fileInput}
            onChange={handleFileChange}
            data-testid="attachment-file-input"
          />
          <Button small onClick={() => fileInputRef.current?.click()} disabled={isUploading} data-testid="attachment-upload-button">
            <Paperclip size={13} className={styles.addIcon} />
            {isUploading ? 'Subiendo...' : 'Agregar archivo'}
          </Button>
        </div>
      </div>

      {(!attachments || attachments.length === 0) && (
        <p className={styles.emptyText}>Sin archivos adjuntos</p>
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
