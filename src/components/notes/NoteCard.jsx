import React from 'react'
import { ListItem } from 'framework7-react'
import { navigate } from '../../utils/f7navigate'

export default function NoteCard({ note, notebookId }) {
  const count = note.attachments?.length ?? 0

  return (
    <ListItem
      title={note.title}
      after={count > 0 ? `${count} archivo${count !== 1 ? 's' : ''}` : undefined}
      link
      onClick={() => navigate(`/notebooks/${notebookId}/notes/${note.id}`)}
    />
  )
}
