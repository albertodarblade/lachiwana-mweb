import React from 'react'
import SearchFilterSheet from '../SearchFilterSheet'

export default function TransactionFilterPanel({ opened, onClose, tags, filters, onApply }) {
  return (
    <SearchFilterSheet
      opened={opened}
      onClose={onClose}
      filters={filters}
      onApply={onApply}
      tags={tags}
      title="Buscar Transacciones"
      placeholder="Buscar en transacciones..."
      testIdPrefix="filter"
    />
  )
}