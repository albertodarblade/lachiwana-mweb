import React, { useState } from 'react'
import { Preloader, Button, f7 } from 'framework7-react'
import { useBlobUrl } from '../../hooks/useBlobUrl'
import { useDeleteAttachment } from '../../hooks/useDeleteAttachment'
import { getBlob } from '../../api/client'

export default function AttachmentItem({ attachment, notebookId, noteId, onImageTap }) {
  const { data, isLoading, isError } = useBlobUrl(attachment.fileSrcId)
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
      a.download = `archivo-${attachment.id}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      f7.toast.create({ text: 'Error al descargar el archivo.', closeTimeout: 3000, position: 'top' }).open()
    } finally {
      setIsDownloading(false)
    }
  }

  const thumbStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '8px',
    overflow: 'hidden',
    position: 'relative',
    background: '#f0f0f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  function renderThumbnail() {
    if (isLoading) {
      return <Preloader size={24} />
    }
    if (isError || !data) {
      return <i className="f7-icons" style={{ fontSize: '28px', opacity: 0.4 }}>photo</i>
    }
    if (data.isImage) {
      return (
        <img
          src={data.dataUrl}
          alt=""
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
          onClick={onImageTap}
          onError={(e) => { e.target.style.display = 'none' }}
        />
      )
    }
    return <i className="f7-icons" style={{ fontSize: '32px', opacity: 0.5 }}>doc</i>
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
      <div style={thumbStyle} onClick={!isLoading && !isError && data?.isImage ? onImageTap : undefined}>
        {renderThumbnail()}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: '0 0 6px', fontSize: '12px', opacity: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {attachment.uploadedBy?.name ?? 'Archivo'}
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {!isLoading && !isError && !data?.isImage && (
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
