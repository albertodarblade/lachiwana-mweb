import { useQuery } from '@tanstack/react-query'
import { listTasks } from '../api/tasks'

function sortByNewestCreated(list) {
  return [...(list ?? [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function useTasks(notebookId, params = {}) {
  return useQuery({
    queryKey: ['tasks', notebookId, params],
    queryFn: () => listTasks(notebookId, params),
    enabled: !!notebookId,
    select: (res) => sortByNewestCreated(res?.data ?? res ?? []),
  })
}
