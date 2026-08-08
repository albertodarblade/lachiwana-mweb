import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTransactionSummary } from '../api/transactions'
import { getTransactions, saveTransactions } from '../lib/db'

export function useTransactionSummary(notebookId) {
  const cacheKey = `transactions-summary:${notebookId ?? ''}`
  const [cached, setCached] = useState(null)

  const getCachedSummary = async () => {
    if (!cacheKey) return
    const data = await getTransactions(cacheKey)
    setCached(data)
  }

  useEffect(() => {
    getCachedSummary()
  }, [cacheKey])

  const query = useQuery({
    queryKey: ['transactions-summary', notebookId],
    queryFn: () => fetchTransactionSummary(notebookId),
    staleTime: 0,
    enabled: !!notebookId,
    select: (res) => res?.data ?? res ?? null,
  })

  useEffect(() => {
    if (cacheKey && query.data) {
      saveTransactions(cacheKey, query.data)
    }
  }, [cacheKey, query.data])

  const data = query.data === undefined ? (cached ?? null) : query.data

  return {
    ...query,
    isLoading: query.isLoading && cached === null,
    data,
  }
}
