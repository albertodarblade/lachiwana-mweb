import { useMutation } from '@tanstack/react-query'
import { f7 } from 'framework7-react'
import { deleteTask } from '../api/tasks'
import queryClient from '../queryClient'

export function useDeleteTask(notebookId, taskId) {
  return useMutation({
    mutationFn: () => deleteTask(notebookId, taskId),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ['task', notebookId, taskId] })
      queryClient.invalidateQueries({ queryKey: ['tasks', notebookId] })
    },
    onError: (err) => {
      f7.toast.create({
        text: err?.message ?? 'Error al eliminar la tarea. Intenta de nuevo.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    },
  })
}
