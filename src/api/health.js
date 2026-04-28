import { get } from './client'

export const fetchHealth = () => get('/api/v1/health')
