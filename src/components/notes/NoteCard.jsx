import React from 'react'
import Markdown from 'react-markdown'
import { navigate } from '../../utils/f7navigate'
import TagChip from '../notebooks/TagChip'
import queryClient from '../../queryClient'
import styles from './NoteCard.module.css'

export default function NoteCard({ note, notebookId }) {
  const count = note.attachments?.length ?? 0
  const content = note.title || ''

  const notebookCache = queryClient.getQueryData(['notebook', notebookId])?.data
  const notebookTags = notebookCache?.tags ?? []
  const notebookColor = notebookCache?.color
  const resolvedTags = (note.tags ?? [])
    .map((id) => notebookTags.find((t) => t.id === id))
    .filter(Boolean)

  return (
    <div
      onClick={() => navigate(`/notebooks/${notebookId}/notes/${note.id}`)}
      className={styles.card}
    >
      <div className={styles.row}>
        <div className={styles.preview}>
          <Markdown>{content || '*(sin contenido)*'}</Markdown>
        </div>
        {count > 0 && (
          <span className={styles.attachmentCount}>
            {count} archivo{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {resolvedTags.length > 0 && (
        <div className={styles.tags}>
          {resolvedTags.map((tag) => <TagChip key={tag.id} tag={tag} color={notebookColor} />)}
        </div>
      )}
    </div>
  )
}
