import { useQuery } from '@tanstack/react-query'
import { listNotes } from '../api/notes'

export function useNotes(notebookId) {
  return useQuery({
    queryKey: ['notes', notebookId],
    queryFn: () => listNotes(notebookId),
    enabled: !!notebookId,
  })
}
