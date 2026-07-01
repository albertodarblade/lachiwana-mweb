import React, { useState } from 'react'
import { Paperclip } from 'lucide-react'
import { Actions, ActionsGroup, ActionsButton } from 'framework7-react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { navigate } from '../../utils/f7navigate'
import queryClient from '../../queryClient'
import TagChip from '../notebooks/TagChip'
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
  const notebookCache = queryClient.getQueryData(['notebook', notebookId])?.data
  const notebookColor = notebookCache?.color
  const notebookTags = notebookCache?.tags ?? []
  const resolvedTags = (note.tags ?? [])
    .map((id) => notebookTags.find((t) => t.id === id))
    .filter(Boolean)

  const { title, body } = parseContent(note.content)
  const hasAttachments = (note.attachments?.length ?? 0) > 0
  const date = note.updatedAt || note.createdAt

  const [actionsOpen, setActionsOpen] = useState(false)
  const [pendingLinkUrl, setPendingLinkUrl] = useState(null)

  function handleCardClick(e) {
    const link = e.target.closest('a')
    if (link) {
      e.preventDefault()
      setPendingLinkUrl(link.href)
      setActionsOpen(true)
    } else {
      navigate(`/notebooks/${notebookId}/notes/${note.id}`)
    }
  }

  function handleOpenLink() {
    setActionsOpen(false)
    window.open(pendingLinkUrl, '_blank')
  }

  function handleOpenNote() {
    setActionsOpen(false)
    navigate(`/notebooks/${notebookId}/notes/${note.id}`)
  }

  return (
    <>
      <div
        className={styles.card}
        onClick={handleCardClick}
        data-testid={`note-card-${note.id}`}
      >
        {title && <p className={styles.title}>{title}</p>}
        {body && (
          <div
            className={styles.body}
            style={notebookColor ? { '--notebook-color': notebookColor } : undefined}
          >
            <Markdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>{body}</Markdown>
          </div>
        )}
        {resolvedTags.length > 0 && (
          <div className={styles.tags}>
            {resolvedTags.map((tag) => (
              <TagChip key={tag.id} tag={tag} color={notebookColor} />
            ))}
          </div>
        )}
        <div className={styles.footer}>
          <span className={styles.date}>{formatDate(date)}</span>
          {hasAttachments && (
            <span className={styles.attachBadge}>
              <Paperclip size={14} className={styles.attachIcon} />
              <span className={styles.attachCount}>{note.attachments.length}</span>
            </span>
          )}
        </div>
      </div>

      <Actions opened={actionsOpen} onActionsClosed={() => setActionsOpen(false)}>
        <ActionsGroup>
          <ActionsButton onClick={handleOpenLink}>Abrir link</ActionsButton>
          <ActionsButton onClick={handleOpenNote}>Abrir nota</ActionsButton>
        </ActionsGroup>
        <ActionsGroup>
          <ActionsButton bold onClick={() => setActionsOpen(false)}>Cancelar</ActionsButton>
        </ActionsGroup>
      </Actions>
    </>
  )
}
