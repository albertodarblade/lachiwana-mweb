import { get, post } from './client'

export const fetchTransactions = (notebookId, params = {}) => {
  const query = new URLSearchParams()
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)
  if (params.content) query.set('content', params.content)
  if (params.tags?.length) params.tags.forEach((t) => query.append('tags', t))
  const qs = query.toString()
  return get(`/api/v1/notebooks/${notebookId}/transactions${qs ? `?${qs}` : ''}`)
}

export const createTransaction = (notebookId, payload) =>
  post(`/api/v1/notebooks/${notebookId}/transactions`, payload)
