import queryClient from '../queryClient'
import { getSession, clearSession } from '../stores/authStore'

const BASE_URL = import.meta.env.LACHIWANA_SERVICE_URL

async function request(method, path) {
  const session = getSession()
  const headers = {}
  if (session?.token) {
    headers['Authorization'] = `Bearer ${session.token}`
  }

  const response = await fetch(`${BASE_URL}${path}`, { method, headers })

  if (response.status === 401) {
    clearSession()
    queryClient.clear()
    window.location.href = '/login?expired=1'
    throw new Error('Session expired')
  }

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}

export const get = (path) => request('GET', path)

export function post(path, body) {
  const session = getSession()
  const headers = { 'Content-Type': 'application/json' }
  if (session?.token) headers['Authorization'] = `Bearer ${session.token}`

  return fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  }).then(async (response) => {
    if (response.status === 401) {
      clearSession()
      queryClient.clear()
      window.location.href = '/login?expired=1'
      throw new Error('Session expired')
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    return response.json()
  })
}
