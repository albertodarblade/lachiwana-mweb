import React, { useState } from 'react'
import { Preloader, Button, f7 } from 'framework7-react'
import { useBlobUrl } from '../../hooks/useBlobUrl'
import { useDeleteAttachment } from '../../hooks/useDeleteAttachment'
import { getBlob } from '../../api/client'

const EXT_ICONS = {
  pdf: 'doc_text',
  doc: 'doc', docx: 'doc',
  xls: 'table', xlsx: 'table',
  mp4: 'videocam', mov: 'videocam', avi: 'videocam', mkv: 'videocam',
  mp3: 'music_note', wav: 'music_note', m4a: 'music_note',
  zip: 'archivebox', rar: 'archivebox',
}

function fileIcon(extension) {
  return EXT_ICONS[extension?.toLowerCase()] ?? 'paperclip'
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

  const thumbStyle = {
    width: '72px',
    height: '72px',
    borderRadius: '8px',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    cursor: isImage && blobData ? 'pointer' : 'default',
  }

  function renderThumbnail() {
    if (isImage) {
      if (isLoading) return <Preloader size={24} />
      if (isError || !blobData) return <i className="f7-icons" style={{ fontSize: '28px', opacity: 0.4 }}>photo</i>
      return (
        <img
          src={blobData.dataUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      )
    }
    return <i className="f7-icons" style={{ fontSize: '32px', opacity: 0.5 }}>{fileIcon(attachment.extension)}</i>
  }

  const sizeLabel = formatSize(attachment.size)
  const nameLabel = attachment.extension
    ? `${attachment.extension.toUpperCase()}${sizeLabel ? ` · ${sizeLabel}` : ''}`
    : sizeLabel

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}
    >
      <div style={thumbStyle} onClick={isImage && blobData ? onImageTap : undefined}>
        {renderThumbnail()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 2px', fontSize: '12px', opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {attachment.uploadedBy?.name ?? 'Archivo'}
        </p>
        {nameLabel && (
          <p style={{ margin: '0 0 6px', fontSize: '11px', opacity: 0.4 }}>{nameLabel}</p>
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isImage && (
            <Button small outline disabled={isDownloading} onClick={handleDownload}>
              {isDownloading ? '...' : 'Descargar'}
            </Button>
          )}
          <Button small color="red" outline onClick={handleDelete}>
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}
