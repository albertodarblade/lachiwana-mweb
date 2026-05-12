import { get, post, patch, del } from './client'

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

export const updateTransaction = (notebookId, transactionId, payload) =>
  patch(`/api/v1/notebooks/${notebookId}/transactions/${transactionId}`, payload)

export const fetchTransaction = (notebookId, transactionId) =>
  get(`/api/v1/notebooks/${notebookId}/transactions/${transactionId}`)

export const deleteTransaction = (notebookId, transactionId) =>
  del(`/api/v1/notebooks/${notebookId}/transactions/${transactionId}`)
