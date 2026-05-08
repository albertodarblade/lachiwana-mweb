import React from 'react'
import Markdown from 'react-markdown'
import { navigate } from '../../utils/f7navigate'
import queryClient from '../../queryClient'
import styles from './NoteCard.module.css'

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

function parseContent(markdown) {
  const lines = (markdown || '').split('\n')
  const firstNonEmpty = lines.find((l) => l.trim()) ?? ''
  const headingMatch = firstNonEmpty.match(/^#{1,6}\s+(.+)/)
  if (headingMatch) {
    const idx = lines.indexOf(firstNonEmpty)
    return { title: headingMatch[1], body: lines.slice(idx + 1).join('\n').trim() }
  }
  return { title: null, body: markdown || '' }
}

export default function NoteCard({ note, notebookId }) {
  const notebookColor = queryClient.getQueryData(['notebook', notebookId])?.data?.color
  const { title, body } = parseContent(note.title)
  const hasAttachments = (note.attachments?.length ?? 0) > 0
  const date = note.updatedAt || note.createdAt

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/notebooks/${notebookId}/notes/${note.id}`)}
    >
      {title && <p className={styles.title}>{title}</p>}
      {body && (
        <div className={styles.body}>
          <Markdown>{body}</Markdown>
        </div>
      )}
      <div className={styles.footer}>
        <span className={styles.date}>{formatDate(date)}</span>
        {hasAttachments && (
          <span className={styles.attachBadge}>
            <i className={['f7-icons', styles.attachIcon].join(' ')}>paperclip</i>
            <span className={styles.attachCount}>{note.attachments.length}</span>
          </span>
        )}
      </div>
    </div>
  )
}
