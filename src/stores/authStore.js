import { clearToken } from './tokenStore'

const SESSION_KEY = 'lachiwana_session'

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getUser() {
  return getSession()?.user ?? null
}

export function setUser(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ user }))
}

export function clearSession() {
  clearToken()
  localStorage.removeItem(SESSION_KEY)
  localStorage.removeItem('lachiwana_rt')
}
