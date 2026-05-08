import React from 'react'
import Markdown from 'react-markdown'
import { navigate } from '../../utils/f7navigate'
import TagChip from '../notebooks/TagChip'
import queryClient from '../../queryClient'

export default function NoteCard({ note, notebookId }) {
  const count = note.attachments?.length ?? 0
  const content = note.title || ''

  const notebookTags = queryClient.getQueryData(['notebook', notebookId])?.data?.tags ?? []
  const resolvedTags = (note.tags ?? [])
    .map((id) => notebookTags.find((t) => t.id === id))
    .filter(Boolean)

  return (
    <div
      onClick={() => navigate(`/notebooks/${notebookId}/notes/${note.id}`)}
      style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--f7-list-item-border-color)',
        cursor: 'pointer',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div
          style={{
            flex: 1,
            minHeight: '7.5em',
            maxHeight: '12em',
            overflow: 'hidden',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)',
            fontSize: 14,
            lineHeight: 1.5,
            pointerEvents: 'none',
          }}
        >
          <Markdown>{content || '*(sin contenido)*'}</Markdown>
        </div>
        {count > 0 && (
          <span style={{ fontSize: 12, opacity: 0.5, flexShrink: 0 }}>
            {count} archivo{count !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      {resolvedTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
          {resolvedTags.map((tag) => <TagChip key={tag.id} tag={tag} />)}
        </div>
      )}
    </div>
  )
}
