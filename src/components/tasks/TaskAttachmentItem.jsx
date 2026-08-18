import { useState } from 'react'
import { Image as ImageIcon, FileText, File, Table, Video, Music, Archive, Paperclip, Download, Trash2 } from 'lucide-react'
import { Preloader, f7 } from 'framework7-react'
import { useBlobUrl } from '../../hooks/useBlobUrl'
import styles from './TaskAttachmentItem.module.css'

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

export default function TaskAttachmentItem({ attachment, onImageTap, onDownload, onDelete }) {
  const isImage = attachment.mimeType?.startsWith('image/')
  const { data: blobData, isLoading, isError } = useBlobUrl(isImage ? attachment.fileSrcId : null)
  const [isDownloading, setIsDownloading] = useState(false)

  async function handleDownload(e) {
    e.stopPropagation()
    setIsDownloading(true)
    try {
      await onDownload(attachment)
    } finally {
      setIsDownloading(false)
    }
  }

  function handleDelete(e) {
    e.stopPropagation()
    f7.dialog.confirm(
      '¿Eliminar este archivo?',
      'Eliminar archivo',
      () => onDelete(attachment),
    )
  }

  const sizeLabel = formatSize(attachment.size)
  const extLabel = attachment.extension?.toUpperCase()

  if (isImage) {
    return (
      <div
        className={`${styles.item} ${styles.itemImage}`}
        onClick={() => blobData && onImageTap?.(attachment)}
        data-testid={`task-attachment-${attachment.id}`}
      >
        <div className={styles.thumbWrap}>
          {isLoading && (
            <div className={styles.loadingWrap}>
              <Preloader size={24} />
            </div>
          )}
          {isError && (
            <div className={styles.loadingWrap}>
              <ImageIcon size={32} className={styles.thumbIcon} />
            </div>
          )}
          {blobData && (
            <img
              src={blobData.dataUrl}
              alt=""
              className={styles.thumbImg}
              onError={(e) => { e.target.style.display = 'none' }}
            />
          )}
        </div>
        <div className={styles.imageOverlay}>
          <button
            className={styles.overlayBtn}
            onClick={handleDownload}
            data-testid={`task-attachment-download-${attachment.id}`}
          >
            <Download size={16} />
          </button>
          <button
            className={styles.overlayBtn}
            onClick={handleDelete}
            data-testid={`task-attachment-delete-${attachment.id}`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.item} ${styles.itemFile}`} data-testid={`task-attachment-${attachment.id}`}>
      <div className={styles.fileIconWrap}>
        <FileIcon extension={attachment.extension} size={20} />
      </div>
      <div className={styles.fileMeta}>
        <p className={styles.fileName}>{extLabel || 'ARCHIVO'}</p>
        {sizeLabel && <p className={styles.fileInfo}>{sizeLabel}</p>}
      </div>
      <div className={styles.fileActions}>
        <button
          className={`${styles.fileActionBtn} ${styles.fileActionBtnDownload}`}
          onClick={handleDownload}
          disabled={isDownloading}
          data-testid={`task-attachment-download-${attachment.id}`}
        >
          <Download size={16} />
        </button>
        <button
          className={`${styles.fileActionBtn} ${styles.fileActionBtnDelete}`}
          onClick={handleDelete}
          data-testid={`task-attachment-delete-${attachment.id}`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
