import { useQuery } from '@tanstack/react-query'
import { getNote } from '../api/notes'
import queryClient from '../queryClient'

export function useNote(notebookId, noteId) {
  return useQuery({
    queryKey: ['note', notebookId, noteId],
    queryFn: () => getNote(notebookId, noteId),
    enabled: !!notebookId && !!noteId,
    // Pre-populate from the notes list cache so the title field is never blank
    // while the detail query is in flight (FR-018).
    initialData: () => {
      const list = queryClient.getQueryData(['notes', notebookId])
      const note = list?.data?.find((n) => n.id === noteId)
      if (!note) return undefined
      return { ...list, data: note }
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(['notes', notebookId])?.dataUpdatedAt,
  })
}
