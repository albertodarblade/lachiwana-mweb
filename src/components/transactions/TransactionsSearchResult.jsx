import React from 'react'
import { Block, Preloader, Button } from 'framework7-react'
import TransactionCard from './TransactionCard'
import TransactionEmptyState from './TransactionEmptyState'
import styles from './TransactionsSearchResult.module.css'

export default function TransactionsSearchResult({
  transactions = [],
  filters,
  tags = [],
  color,
  isLoading,
  isPaused,
  isError,
  staleError,
  onDismissError,
  onClearFilters,
  onSelect,
}) {
  function resolveTagIds(tagIds = []) {
    return tagIds
      .map((tagId) => tags.find((t) => (t.id ?? t._id) === tagId))
      .filter(Boolean)
  }

  const count = transactions.length
  const summary = count === 1
    ? '1 transacción encontrada'
    : `${count} transacciones encontradas`
  const suffix = filters?.content ? ` para "${filters.content}"` : ''

  return (
    <div className={styles.wrap} data-testid="transactions-search-results">
      <div className={styles.header}>
        <p className={styles.count} data-testid="transactions-search-count">
          {isLoading ? 'Buscando...' : `${summary}${suffix}`}
        </p>
        <Button
          small
          round
          outline
          className={styles.clearBtn}
          onClick={onClearFilters}
          data-testid="transactions-search-clear"
        >
          Limpiar filtros
        </Button>
      </div>

      <div className={styles.list}>
        {staleError && (
          <Block className={styles.centered}>
            <p>Error al cargar. Mostrando datos guardados.</p>
            <span className={styles.dismiss} onClick={onDismissError}>Descartar</span>
          </Block>
        )}
        {isPaused ? (
          <Block className={styles.centered}>
            <p>Sin conexión — mostrando datos guardados.</p>
          </Block>
        ) : isLoading ? (
          <Block className={styles.centered}>
            <Preloader size={44} />
          </Block>
        ) : isError && count === 0 ? (
          <Block className={styles.centered}>
            <p>Error al cargar los movimientos.</p>
          </Block>
        ) : count === 0 ? (
          <TransactionEmptyState />
        ) : (
          transactions.map((t) => (
            <TransactionCard
              key={t.id}
              transaction={{ ...t, tags: resolveTagIds(t.tags) }}
              color={color}
              onClick={() => onSelect(t)}
            />
          ))
        )}
      </div>
    </div>
  )
}