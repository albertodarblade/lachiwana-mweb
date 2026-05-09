import { useMutation } from '@tanstack/react-query'
import { createTransaction } from '../api/transactions'
import queryClient from '../queryClient'

export function useCreateTransaction(notebookId) {
  return useMutation({
    mutationFn: (payload) => createTransaction(notebookId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', notebookId] })
    },
  })
}
