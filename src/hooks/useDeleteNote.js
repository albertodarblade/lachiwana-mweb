import { useMutation } from '@tanstack/react-query'
import { deleteNote } from '../api/notes'
import queryClient from '../queryClient'
import { f7 } from 'framework7-react'

// Intentionally non-optimistic per spec: deletion waits for server confirmation.
// A 5-second countdown gate in the UI prevents accidental deletion.
export function useDeleteNote(notebookId, noteId) {
  return useMutation({
    mutationFn: () => deleteNote(notebookId, noteId),
    onSuccess: () => {
      // NOTE: do NOT removeQueries(['note', …]) here. Removing the detail query
      // while NoteEditorPage is still mounted makes useNote rebuild a data-less
      // query, which flips the page into its loading branch mid-transition —
      // React then tries to remove the delete Sheet's DOM node, but Framework7
      // parks modal elements outside the page until their close animation ends
      // ("Failed to execute 'removeChild' on 'Node'"). The stale detail query
      // is dropped by NoteEditorPage on unmount once the delete is confirmed.
      queryClient.invalidateQueries({ queryKey: ['notes', notebookId] })
    },
    onError: (err) => {
      f7.toast.create({
        text: err?.message ?? 'Error al eliminar la nota. Intenta de nuevo.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    },
  })
}
