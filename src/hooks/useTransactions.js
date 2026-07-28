import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchTransactions } from '../api/transactions'
import { getTransactions, saveTransactions } from '../lib/db'

function monthDateRange(year, month) {
  const pad = (n) => String(n).padStart(2, '0')
  const from = `${year}-${pad(month)}-01T00:00:00.000Z`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${pad(month)}-${pad(lastDay)}T23:59:59.999Z`
  return { from, to }
}

function makeCacheKey(notebookId, params = {}) {
  const sorted = Object.keys(params).sort().reduce((acc, k) => {
    acc[k] = params[k]
    return acc
  }, {})
  return `transactions:${notebookId ?? ''}:${JSON.stringify(sorted)}`
}

export function useTransactions(notebookId, { year, month, content, tags } = {}) {
  const byMonth = year != null && month != null
  const range = byMonth ? monthDateRange(year, month) : {}

  const params = {
    ...range,
    ...(content ? { content } : {}),
    ...(tags?.length ? { tags } : {}),
  }

  const cacheKey = makeCacheKey(notebookId, params)
  const [cached, setCached] = useState(null)

  const getCachedTransactions = async () => {
    if (!cacheKey) return
    const data = await getTransactions(cacheKey)
    setCached(data)
  }

  useEffect(() => {
    getCachedTransactions()
  }, [cacheKey])

  const query = useQuery({
    queryKey: ['transactions', notebookId, params],
    queryFn: () => fetchTransactions(notebookId, params),
    staleTime: 0,
    enabled: !!notebookId,
    select: (res) => res?.data ?? res ?? [],
  })

  useEffect(() => {
    if (cacheKey && query.data) {
      saveTransactions(cacheKey, query.data)
    }
  }, [cacheKey, query.data])

  const data = query.data === undefined ? (cached ?? []) : query.data

  return {
    ...query,
    isLoading: query.isLoading && cached === null,
    data,
  }
}
