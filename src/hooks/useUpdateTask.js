import { useMutation } from '@tanstack/react-query'
import { updateTask } from '../api/tasks'
import queryClient from '../queryClient'
import { f7 } from 'framework7-react'

export function useUpdateTask(notebookId) {
  return useMutation({
    mutationFn: ({ taskId, ...payload }) => updateTask(notebookId, taskId, payload),

    onMutate: async ({ taskId, ...payload }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', notebookId] })

      const snapshots = queryClient.getQueriesData({ queryKey: ['tasks', notebookId] })

      queryClient.setQueriesData({ queryKey: ['tasks', notebookId] }, (old) => {
        if (!old) return old
        const data = Array.isArray(old) ? old : (old?.data ?? [])
        const patched = data.map((t) =>
          t.id === taskId ? { ...t, ...payload, updatedAt: new Date().toISOString() } : t
        )
        return Array.isArray(old) ? patched : { ...old, data: patched }
      })

      return { snapshots }
    },

    onError: (_err, _vars, context) => {
      context?.snapshots?.forEach(([key, value]) => queryClient.setQueryData(key, value))
      f7.toast.create({
        text: 'Error al guardar. Los cambios no fueron guardados.',
        closeTimeout: 3000,
        position: 'top',
      }).open()
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', notebookId] })
    },
  })
}
