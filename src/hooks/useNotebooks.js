import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchNotebooks } from '../api/notebooks'
import { getUser } from '../stores/authStore'
import { getNotebooks, saveNotebooks } from '../lib/db'

export function useNotebooks() {
  const userId = getUser()?.googleId
  const [cached, setCached] = useState(null)

  const getCachedNotebooks = async () => {
    const data = await getNotebooks(userId);
    setCached(data);
  }

  // try to set cache;
  useEffect(() => {
    getCachedNotebooks();
  }, [])

  const query = useQuery({
    queryKey: ['notebooks'],
    queryFn: fetchNotebooks,
    staleTime: 0,
    enabled: !!userId,
  })

  // Saves cache
  useEffect(() => {
    if (userId && query.data?.data) {
      saveNotebooks(userId, query.data.data)
    }
  }, [userId, query.data])
  const cachedData = cached ? { data: cached } : []
  const data = query.data === undefined ? cachedData : query.data;
  return {
    ...query,
    isLoading: query.isLoading && cached === null,
    data
  }
}
