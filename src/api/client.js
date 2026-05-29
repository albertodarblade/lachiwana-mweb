import { f7 } from 'framework7-react'
import queryClient from '../queryClient'
import { getToken, setToken } from '../stores/tokenStore'
import { clearSession } from '../stores/authStore'
import { refreshToken } from './auth'

const BASE_URL = import.meta.env.LACHIWANA_SERVICE_URL

let _refreshPromise = null

function _authHeaders() {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function _handleAuthFailure() {
  clearSession()
  queryClient.clear()
  window.location.replace('/login?expired=1')
}

async function _silentRefresh() {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = refreshToken().finally(() => { _refreshPromise = null })
  return _refreshPromise
}

async function _request(method, path, { body, isForm, isBlob } = {}) {
  const headers = { ..._authHeaders() }
  let fetchBody

  if (isForm) {
    fetchBody = body
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    fetchBody = JSON.stringify(body)
  }

  const response = await fetch(`${BASE_URL}${path}`, { method, headers, body: fetchBody })

  if (response.status === 401) {
    console.debug('[auth] 401 intercepted, refreshing token')
    try {
      const data = await _silentRefresh()
      setToken(data.accessToken, data.expiresAt)
      console.debug('[auth] token refreshed, retrying')
    } catch (err) {
      if (err?.status === 429) {
        console.debug('[auth] rate limited on refresh')
        f7.toast.create({ text: 'Demasiadas solicitudes, espera un momento.', closeTimeout: 3000 }).open()
        throw new Error('Rate limited')
      }
      console.debug('[auth] refresh failed, signing out')
      _handleAuthFailure()
      throw new Error('Session expired')
    }

    // Retry once with the new token
    const retryHeaders = { ..._authHeaders() }
    if (!isForm && body !== undefined) retryHeaders['Content-Type'] = 'application/json'
    const retry = await fetch(`${BASE_URL}${path}`, { method, headers: retryHeaders, body: fetchBody })
    if (retry.status === 401) {
      _handleAuthFailure()
      throw new Error('Session expired')
    }
    if (!retry.ok) throw new Error(`HTTP ${retry.status}: ${retry.statusText}`)
    if (retry.status === 204) return null
    return isBlob ? retry.blob() : retry.json()
  }

  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  if (response.status === 204) return null
  return isBlob ? response.blob() : response.json()
}

export const get = (path) => _request('GET', path)
export const post = (path, body) => _request('POST', path, { body })
export const patch = (path, body) => _request('PATCH', path, { body })
export const del = (path) => _request('DELETE', path, { body: undefined })
export const getBlob = (path) => _request('GET', path, { isBlob: true })
export const postForm = (path, formData) => _request('POST', path, { body: formData, isForm: true })
