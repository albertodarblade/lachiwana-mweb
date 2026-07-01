const BASE = `${import.meta.env.LACHIWANA_SERVICE_URL}/api/v1/auth`

let _refreshPromise = null

export async function refreshToken() {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = _doRefresh()
  return _refreshPromise
}

async function _doRefresh() {
  console.debug('[auth] refresh called')
  const rt = localStorage.getItem('lachiwana_rt')
  const headers = rt ? { 'X-Refresh-Token': rt } : {}
  try {
    const res = await fetch(`${BASE}/refresh`, {
      method: 'POST',
      headers,
    })
    if (!res.ok) {
      const err = new Error('refresh_failed')
      err.status = res.status
      throw err
    }
    const { data } = await res.json()
    if (data.refreshToken) localStorage.setItem('lachiwana_rt', data.refreshToken)
    console.debug('[auth] refresh success')
    return data
  } finally {
    _refreshPromise = null
  }
}

export async function signOut() {
  console.debug('[auth] signout called')
  const rt = localStorage.getItem('lachiwana_rt')
  const headers = rt ? { 'X-Refresh-Token': rt } : {}
  await fetch(`${BASE}/signout`, {
    method: 'POST',
    headers,
  })
}
