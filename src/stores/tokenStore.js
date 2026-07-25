let _token = null
let _expiresAt = null
let _renewalTimer = null

const RENEWAL_BUFFER_MS = 5 * 60 * 1000
const TOKEN_COOKIE = 'lachiwana_at'

function _setCookie(name, value, expiresAt) {
  const expires = new Date(expiresAt).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Strict`
}

function _getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

function _deleteCookie(name) {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}

export function getToken() {
  if (!_token) {
    const raw = _getCookie(TOKEN_COOKIE)
    if (raw) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed.expiresAt && new Date(parsed.expiresAt).getTime() > Date.now()) {
          _token = parsed.accessToken
          _expiresAt = parsed.expiresAt
          _scheduleRenewal(_expiresAt)
        } else {
          _deleteCookie(TOKEN_COOKIE)
        }
      } catch {
        _deleteCookie(TOKEN_COOKIE)
      }
    }
  }
  return _token
}

export function setToken(accessToken, expiresAt) {
  console.log('setting token', accessToken)
  _token = accessToken
  _expiresAt = expiresAt
  _cancelRenewal()
  _scheduleRenewal(expiresAt)
  _setCookie(TOKEN_COOKIE, JSON.stringify({ accessToken, expiresAt }), expiresAt)
  console.debug('[auth] token stored, renewal scheduled')
}

export function clearToken() {
  _token = null
  _expiresAt = null
  _cancelRenewal()
  _deleteCookie(TOKEN_COOKIE)
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
    const { refreshToken } = await import('../api/auth')
    const data = await refreshToken()
    setToken(data.accessToken, data.expiresAt)
    console.debug('[auth] proactive refresh success')
  } catch (err) {
    if (err?.status === 401) {
      clearToken()
      console.debug('[auth] proactive refresh failed — session expired')
      window.location.replace('/login?expired=1')
    } else {
      console.debug('[auth] proactive refresh failed — transient error, will rely on reactive refresh')
    }
  }
}
