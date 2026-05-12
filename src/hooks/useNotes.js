import { useQuery } from '@tanstack/react-query'
import { listNotes } from '../api/notes'

export function useNotes(notebookId, params = {}) {
  return useQuery({
    queryKey: ['notes', notebookId, params],
    queryFn: () => listNotes(notebookId, params),
    enabled: !!notebookId,
    select: (res) => res?.data ?? res ?? [],
  })
}
