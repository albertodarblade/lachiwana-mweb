import React from 'react'
import SearchFilterSheet from '../SearchFilterSheet'

export default function NoteFilterPanel({ opened, onClose, filters, onApply, tags = [] }) {
  return (
    <SearchFilterSheet
      opened={opened}
      onClose={onClose}
      filters={filters}
      onApply={onApply}
      tags={tags}
      title="Buscar Notas"
      placeholder="Buscar en notas..."
      testIdPrefix="note-filter"
    />
  )
}