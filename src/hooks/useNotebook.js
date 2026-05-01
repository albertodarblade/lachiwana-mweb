import { useQuery } from '@tanstack/react-query'
import { fetchNotebooks } from '../api/notebooks'

export function useNotebook(id) {
  return useQuery({
    queryKey: ['notebooks'],
    queryFn: fetchNotebooks,
    select: (data) => data?.data?.find((n) => n.id === id),
  })
}
