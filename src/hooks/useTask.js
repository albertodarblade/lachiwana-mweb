import { useQuery } from '@tanstack/react-query'
import { getTask } from '../api/tasks'
import queryClient from '../queryClient'

export function useTask(notebookId, taskId, { enabled = true } = {}) {
  return useQuery({
    queryKey: ['task', notebookId, taskId],
    queryFn: () => getTask(notebookId, taskId),
    enabled: enabled && !!notebookId && !!taskId,
    select: (res) => res?.data ?? res,
    initialData: () => {
      const all = queryClient.getQueriesData({ queryKey: ['tasks', notebookId] })
      for (const [, data] of all) {
        if (!data) continue
        const list = data.data ?? data
        if (!Array.isArray(list)) continue
        const task = list.find((t) => t.id === taskId)
        if (task) {
          return data.data ? { ...data, data: task } : task
        }
      }
      return undefined
    },
    initialDataUpdatedAt: () => {
      const all = queryClient.getQueriesData({ queryKey: ['tasks', notebookId] })
      for (const [key] of all) {
        const state = queryClient.getQueryState(key)
        if (state?.dataUpdatedAt) return state.dataUpdatedAt
      }
      return undefined
    },
    staleTime: 0,
  })
}
