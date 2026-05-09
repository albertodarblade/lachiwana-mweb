import { useQuery } from '@tanstack/react-query'
import { fetchTransactions } from '../api/transactions'

function monthDateRange(year, month) {
  const pad = (n) => String(n).padStart(2, '0')
  const from = `${year}-${pad(month)}-01T00:00:00.000Z`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${pad(month)}-${pad(lastDay)}T23:59:59.999Z`
  return { from, to }
}

export function useTransactions(notebookId, { year, month, content, tags } = {}) {
  const byMonth = year != null && month != null
  const range = byMonth ? monthDateRange(year, month) : {}

  const params = {
    ...range,
    ...(content ? { content } : {}),
    ...(tags?.length ? { tags } : {}),
  }

  return useQuery({
    queryKey: ['transactions', notebookId, params],
    queryFn: () => fetchTransactions(notebookId, params),
    enabled: !!notebookId,
    select: (res) => res?.data ?? res ?? [],
  })
}
