import { refreshToken } from '../api/auth'

let _token = null
let _expiresAt = null
let _renewalTimer = null

const RENEWAL_BUFFER_MS = 5 * 60 * 1000

export function getToken() {
  return _token
}

export function setToken(accessToken, expiresAt) {
  _token = accessToken
  _expiresAt = expiresAt
  _cancelRenewal()
  _scheduleRenewal(expiresAt)
  console.debug('[auth] token stored, renewal scheduled')
}

export function clearToken() {
  _token = null
  _expiresAt = null
  _cancelRenewal()
  console.debug('[auth] token cleared')
}

function _cancelRenewal() {
  if (_renewalTimer !== null) {
    clearTimeout(_renewalTimer)
    _renewalTimer = null
  }
}

function _scheduleRenewal(expiresAt) {
  if (!expiresAt) return
  const delay = new Date(expiresAt).getTime() - Date.now() - RENEWAL_BUFFER_MS
  if (delay <= 0) {
    _proactiveRefresh()
  } else {
    _renewalTimer = setTimeout(_proactiveRefresh, delay)
  }
}

async function _proactiveRefresh() {
  _renewalTimer = null
  console.debug('[auth] proactive refresh triggered')
  try {
    const data = await refreshToken()
    setToken(data.accessToken, data.expiresAt)
    console.debug('[auth] proactive refresh success')
  } catch (err) {
    if (err?.status === 401) {
      clearToken()
      console.debug('[auth] proactive refresh failed — session expired')
      window.location.replace('/login?expired=1')
    } else {
      // 429 or network error — leave token in place; reactive refresh will handle next 401
      console.debug('[auth] proactive refresh failed — transient error, will rely on reactive refresh')
    }
  }
}
