import { useQuery } from '@tanstack/react-query'
import { fetchTransaction } from '../api/transactions'

export function useTransaction(notebookId, transactionId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['transaction', notebookId, transactionId],
    queryFn: () => fetchTransaction(notebookId, transactionId),
    enabled: enabled && !!notebookId && !!transactionId,
    select: (res) => res?.data ?? res,
    staleTime: 0,
  })
}
