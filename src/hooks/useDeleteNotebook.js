import { useMutation } from '@tanstack/react-query'
import { deleteNotebook } from '../api/notebooks'
import queryClient from '../queryClient'

// Intentionally non-optimistic per spec: deletion waits for server confirmation.
// A 5-second countdown gate in the UI prevents accidental deletion.
export function useDeleteNotebook() {
  return useMutation({
    mutationFn: (id) => deleteNotebook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notebooks'] })
    },
  })
}
