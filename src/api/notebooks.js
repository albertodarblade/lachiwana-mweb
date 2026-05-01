import { get, post, patch, del } from './client'

export const fetchNotebooks = () => get('/api/v1/notebooks')

export const fetchNotebook = (id) => get(`/api/v1/notebooks/${id}`)

export const createNotebook = (payload) => post('/api/v1/notebooks', payload)

export const updateNotebook = (id, payload) => patch(`/api/v1/notebooks/${id}`, payload)

export const deleteNotebook = (id) => del(`/api/v1/notebooks/${id}`)
