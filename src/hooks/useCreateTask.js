import { useMutation } from '@tanstack/react-query'
import { createTask } from '../api/tasks'
import queryClient from '../queryClient'

export function useCreateTask(notebookId) {
  return useMutation({
    mutationFn: (payload) => createTask(notebookId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', notebookId] })
    },
  })
}
