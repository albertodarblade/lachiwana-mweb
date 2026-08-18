import React from 'react'
import { Paperclip, X } from 'lucide-react'
import styles from './PendingAttachmentItem.module.css'

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PendingAttachmentItem({ file, onRemove }) {
  return (
    <div className={styles.item} data-testid={`pending-attachment-${file.name}`}>
      <Paperclip size={18} className={styles.icon} />
      <div className={styles.meta}>
        <p className={styles.fileName}>{file.name}</p>
        <p className={styles.fileSize}>{formatSize(file.size)}</p>
      </div>
      <button className={styles.removeBtn} onClick={onRemove} aria-label="Eliminar archivo" data-testid={`pending-attachment-remove-${file.name}`}>
        <X size={16} />
      </button>
    </div>
  )
}
