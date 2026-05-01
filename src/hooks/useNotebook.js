import { useQuery } from '@tanstack/react-query'
import { fetchNotebook } from '../api/notebooks'

export function useNotebook(id) {
  return useQuery({
    queryKey: ['notebook', id],
    queryFn: () => fetchNotebook(id),
    enabled: !!id,
    select: (data) => data?.data,
  })
}
