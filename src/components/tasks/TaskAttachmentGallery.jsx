import { useRef } from 'react'
import { Paperclip } from 'lucide-react'
import { PhotoBrowser, Preloader, f7 } from 'framework7-react'
import { useQueries } from '@tanstack/react-query'
import { getBlob } from '../../api/client'
import TaskAttachmentItem from './TaskAttachmentItem'
import styles from './TaskAttachmentGallery.module.css'

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({ dataUrl: reader.result, mimeType: blob.type })
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

async function downloadAttachment(att) {
  const blob = await getBlob(`/api/v1/files/${att.fileSrcId}`)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `archivo-${att.id}${att.extension ? `.${att.extension}` : ''}`
  a.click()
  URL.revokeObjectURL(url)
}

export default function TaskAttachmentGallery({ attachments, onFileChange, onDelete, isUploading }) {
  const photoBrowserRef = useRef(null)
  const galleryRef = useRef(null)
  const cameraRef = useRef(null)

  const imageAttachments = (attachments ?? []).filter(a => a.mimeType?.startsWith('image/'))
  const fileAttachments = (attachments ?? []).filter(a => !a.mimeType?.startsWith('image/'))

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

  const hasAny = (attachments?.length ?? 0) > 0

  function handleClick() {
    f7.actions.create({
      buttons: [
        { text: 'Cámara', onClick: () => cameraRef.current?.click() },
        { text: 'Galería', onClick: () => galleryRef.current?.click() },
        { text: 'Cancelar', color: 'red' },
      ],
    }).open()
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span className={styles.headerTitle}>Archivos adjuntos</span>
      </div>

      {!hasAny && (
        <p className={styles.emptyText}>Sin archivos adjuntos</p>
      )}

      {imageAttachments.length > 0 && (
        <div className={styles.imageGrid}>
          {imageAttachments.map((att) => (
            <TaskAttachmentItem
              key={att.id}
              attachment={att}
              onImageTap={handleImageTap}
              onDownload={downloadAttachment}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {fileAttachments.length > 0 && (
        <div className={styles.fileList}>
          {fileAttachments.map((att) => (
            <TaskAttachmentItem
              key={att.id}
              attachment={att}
              onDownload={downloadAttachment}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {isUploading && (
        <div className={styles.uploadingRow}>
          <Preloader size={20} />
          <span className={styles.uploadingText}>Subiendo archivo...</span>
        </div>
      )}

      <input
        ref={galleryRef}
        type="file"
        className={styles.fileInput}
        onChange={onFileChange}
        data-testid="edit-task-file-input"
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className={styles.fileInput}
        onChange={onFileChange}
        data-testid="edit-task-camera-input"
      />

      <button
        className={`${styles.addBtn} ${styles.addBtnFull}`}
        onClick={handleClick}
        data-testid="edit-task-add-attachment"
      >
        <Paperclip size={14} />
        Agregar archivo
      </button>

      <PhotoBrowser
        ref={photoBrowserRef}
        photos={imagePhotos}
        theme="dark"
        type="popup"
      />
    </div>
  )
}
