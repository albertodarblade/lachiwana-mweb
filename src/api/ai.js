import { f7 } from 'framework7-react'
import { getToken, setToken } from '../stores/tokenStore'
import { clearSession } from '../stores/authStore'
import { refreshToken } from './auth'

const BASE_URL = import.meta.env.LACHIWANA_SERVICE_URL

function parseBlock(block, { onChunk, onDone }) {
  let eventType = 'message'
  let dataLine = ''
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) eventType = line.slice(6).trim()
    else if (line.startsWith('data:')) dataLine += line.slice(5).trim()
  }
  if (!dataLine) return
  if (eventType === 'error') {
    let message = dataLine
    try {
      message = JSON.parse(dataLine).message ?? dataLine
    } catch {
      /* keep raw data line */
    }
    const err = new Error(message)
    err.streamError = true
    throw err
  }
  if (dataLine === '[DONE]') return
  let json
  try {
    json = JSON.parse(dataLine)
  } catch {
    return
  }
  if (typeof json.answer === 'string') onChunk(json.answer)
  else if (json.done) onDone()
}

async function streamBody(res, { onChunk, onDone }) {
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let idx
    while ((idx = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, idx)
      buffer = buffer.slice(idx + 2)
      parseBlock(block, { onChunk, onDone })
    }
  }
  if (buffer.trim()) parseBlock(buffer, { onChunk, onDone })
}

async function doRequest(url, question, signal) {
  const token = getToken()
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ question }),
    signal,
  })
}

export async function askTransactions(notebookId, { question, from, to, onChunk, onDone, signal }) {
  const query = new URLSearchParams()
  if (from) query.set('from', from)
  if (to) query.set('to', to)
  const qs = query.toString()
  const url = `${BASE_URL}/api/v1/notebooks/${notebookId}/ask-transactions${qs ? `?${qs}` : ''}`

  let res = await doRequest(url, question, signal)

  if (res.status === 401) {
    console.debug('[auth] 401 intercepted, refreshing token')
    try {
      const data = await refreshToken()
      setToken(data.accessToken, data.expiresAt)
      console.debug('[auth] token refreshed, retrying')
    } catch (err) {
      if (err?.status === 429) {
        console.debug('[auth] rate limited on refresh')
        f7.toast.create({ text: 'Demasiadas solicitudes, espera un momento.', closeTimeout: 3000 }).open()
        throw new Error('Rate limited')
      }
      if (err?.status === 401) {
        console.debug('[auth] refresh failed, signing out')
        clearSession()
        window.location.replace('/login?expired=1')
        throw new Error('Session expired')
      }
      console.debug('[auth] refresh failed — network error, deferring')
      throw err
    }
    res = await doRequest(url, question, signal)
    if (res.status === 401) {
      clearSession()
      window.location.replace('/login?expired=1')
      throw new Error('Session expired')
    }
  }

  if (!res.ok) {
    const err = new Error(`HTTP ${res.status}: ${res.statusText}`)
    err.status = res.status
    throw err
  }
  if (!res.body) return

  await streamBody(res, { onChunk, onDone })
}