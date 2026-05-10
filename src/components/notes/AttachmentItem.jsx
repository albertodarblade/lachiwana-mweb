import React, { useState } from 'react'
import { Image as ImageIcon, FileText, File, Table, Video, Music, Archive, Paperclip } from 'lucide-react'
import { Preloader, Button, f7 } from 'framework7-react'
import { useBlobUrl } from '../../hooks/useBlobUrl'
import { useDeleteAttachment } from '../../hooks/useDeleteAttachment'
import { getBlob } from '../../api/client'
import styles from './AttachmentItem.module.css'

const EXT_ICONS = {
  pdf: FileText,
  doc: File, docx: File,
  xls: Table, xlsx: Table,
  mp4: Video, mov: Video, avi: Video, mkv: Video,
  mp3: Music, wav: Music, m4a: Music,
  zip: Archive, rar: Archive,
}

function FileIcon({ extension, size, className }) {
  const Icon = EXT_ICONS[extension?.toLowerCase()] ?? Paperclip
  return <Icon size={size} className={className} />
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AttachmentItem({ attachment, notebookId, noteId, onImageTap }) {
  const isImage = attachment.mimeType?.startsWith('image/')
  // Only fetch blob for images — non-images don't need a network round-trip
  const { data: blobData, isLoading, isError } = useBlobUrl(isImage ? attachment.fileSrcId : null)
  const { mutate: deleteAttach } = useDeleteAttachment(notebookId, noteId)
  const [isDownloading, setIsDownloading] = useState(false)

  function handleDelete() {
    f7.dialog.confirm(
      '¿Eliminar este archivo?',
      'Eliminar archivo',
      () => deleteAttach(attachment.id),
    )
  }

  async function handleDownload() {
    setIsDownloading(true)
    try {
      const blob = await getBlob(`/api/v1/files/${attachment.fileSrcId}`)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `archivo-${attachment.id}${attachment.extension ? `.${attachment.extension}` : ''}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      f7.toast.create({ text: 'Error al descargar el archivo.', closeTimeout: 3000, position: 'top' }).open()
    } finally {
      setIsDownloading(false)
    }
  }

  const thumbClass = [styles.thumb, isImage && blobData ? styles.thumbClickable : styles.thumbDefault].join(' ')

  function renderThumbnail() {
    if (isImage) {
      if (isLoading) return <Preloader size={24} />
      if (isError || !blobData) return <ImageIcon size={28} className={styles.thumbIconSmall} />
      return (
        <img
          src={blobData.dataUrl}
          alt=""
          className={styles.thumbImg}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      )
    }
    return <FileIcon extension={attachment.extension} size={32} className={styles.thumbIconLarge} />
  }

  const sizeLabel = formatSize(attachment.size)
  const nameLabel = attachment.extension
    ? `${attachment.extension.toUpperCase()}${sizeLabel ? ` · ${sizeLabel}` : ''}`
    : sizeLabel

  return (
    <div className={styles.item}>
      <div className={thumbClass} onClick={isImage && blobData ? onImageTap : undefined} data-testid={`attachment-thumb-${attachment.id}`}>
        {renderThumbnail()}
      </div>

      <div className={styles.meta}>
        <p className={styles.uploadedBy}>
          {attachment.uploadedBy?.name ?? 'Archivo'}
        </p>
        {nameLabel && (
          <p className={styles.fileLabel}>{nameLabel}</p>
        )}
        <div className={styles.actions}>
          {!isImage && (
            <Button small outline disabled={isDownloading} onClick={handleDownload} data-testid={`attachment-download-${attachment.id}`}>
              {isDownloading ? '...' : 'Descargar'}
            </Button>
          )}
          <Button small color="red" outline onClick={handleDelete} data-testid={`attachment-delete-${attachment.id}`}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}
