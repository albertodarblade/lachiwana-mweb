import { get, post } from './client'

export const fetchNotebooks = () => get('/api/v1/notebooks')

export const createNotebook = (payload) => post('/api/v1/notebooks', payload)
