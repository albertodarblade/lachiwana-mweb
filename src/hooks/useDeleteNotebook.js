import { useMutation } from '@tanstack/react-query'
import { deleteNotebook } from '../api/notebooks'
import queryClient from '../queryClient'

// Intentionally non-optimistic per spec: deletion waits for server confirmation.
// A 5-second countdown gate in the UI prevents accidental deletion.
export function useDeleteNotebook() {
  return useMutation({
    mutationFn: (id) => deleteNotebook(id),
    onSuccess: (_data, id) => {
      // Remove the detail entry — it no longer exists
      queryClient.removeQueries({ queryKey: ['notebook', id] })
      // Mark the list stale without immediate refetch; window.location.replace('/')
      // causes a full reload so the list will be fresh on the next home page visit
      queryClient.invalidateQueries({ queryKey: ['notebooks'], refetchType: 'none' })
    },
  })
}
