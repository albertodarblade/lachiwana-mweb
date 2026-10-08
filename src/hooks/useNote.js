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
      // List caches live under ['notes', notebookId, params] (params vary with
      // active filters), so search every variant for this note instead of
      // relying on a bare ['notes', notebookId] key that may not exist.
      const lists = queryClient.getQueriesData({ queryKey: ['notes', notebookId] })
      for (const [, list] of lists) {
        const items = Array.isArray(list) ? list : list?.data
        const note = items?.find((n) => n.id === noteId)
        if (note) return { ...(Array.isArray(list) ? null : list), data: note }
      }
      return undefined
    },
    initialDataUpdatedAt: () =>
      queryClient.getQueryState(['notes', notebookId])?.dataUpdatedAt,
    staleTime: 0,
  })
}
