import { get } from './client'

export const fetchUsers = () => get('/api/v1/users')
