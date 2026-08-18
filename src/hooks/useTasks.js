import { useQuery } from '@tanstack/react-query'
import { listTasks } from '../api/tasks'

export function useTasks(notebookId, params = {}) {
  return useQuery({
    queryKey: ['tasks', notebookId, params],
    queryFn: () => listTasks(notebookId, params),
    enabled: !!notebookId,
    select: (res) => res?.data ?? res ?? [],
  })
}
