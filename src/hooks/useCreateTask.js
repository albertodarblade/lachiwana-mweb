import { useMutation } from '@tanstack/react-query'
import { createTask } from '../api/tasks'
import queryClient from '../queryClient'

export function makeTempId() {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function taskVariants(notebookId) {
  return queryClient.getQueriesData({ queryKey: ['tasks', notebookId] })
}

function addTaskOptimistically(notebookId, task) {
  taskVariants(notebookId).forEach(([key, old]) => {
    if (!Array.isArray(old)) return
    const params = key[2] ?? {}
    const matchesParent = !params.parentTaskId || params.parentTaskId === task.parentTaskId
    if (matchesParent) {
      queryClient.setQueryData(key, [task, ...old])
    }
  })
}

function replaceTaskInCache(notebookId, tempId, realTask) {
  taskVariants(notebookId).forEach(([key, old]) => {
    if (!Array.isArray(old)) return
    queryClient.setQueryData(
      key,
      old.map((t) => (t.id === tempId ? { ...realTask } : t))
    )
  })
}

function removeTaskFromCache(notebookId, taskId) {
  taskVariants(notebookId).forEach(([key, old]) => {
    if (!Array.isArray(old)) return
    queryClient.setQueryData(
      key,
      old.filter((t) => t.id !== taskId)
    )
  })
}

export function useCreateTask(notebookId) {
  return useMutation({
    mutationFn: (payload) => createTask(notebookId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: ['tasks', notebookId] })

      const tempId = payload.__tempId || makeTempId()
      const tempTask = {
        id: tempId,
        title: payload.title ?? '',
        isCompleted: false,
        tags: payload.tags ?? [],
        assignedTo: payload.assignedTo ?? null,
        attachments: [],
        parentTaskId: payload.parentTaskId ?? null,
        _pending: true,
      }
      addTaskOptimistically(notebookId, tempTask)
      return { tempId }
    },
    onSuccess: (data, variables, context) => {
      const realTask = data?.data ?? data
      if (context?.tempId) {
        replaceTaskInCache(notebookId, context.tempId, { ...realTask, _pending: false })
        return
      }
      queryClient.invalidateQueries({ queryKey: ['tasks', notebookId] })
    },
    onError: (err, variables, context) => {
      if (context?.tempId) {
        removeTaskFromCache(notebookId, context.tempId)
      }
    },
    onSettled: (data, error, variables, context) => {
      if (!context?.tempId) return
      // Sync with server truth in the background without blocking the UI.
      queryClient.invalidateQueries({ queryKey: ['tasks', notebookId] })
    },
  })
}
