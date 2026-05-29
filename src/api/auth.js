const BASE = `${import.meta.env.LACHIWANA_SERVICE_URL}/api/v1/auth`

export async function refreshToken() {
  console.debug('[auth] refresh called')
  const res = await fetch(`${BASE}/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
  if (!res.ok) {
    const err = new Error('refresh_failed')
    err.status = res.status
    throw err
  }
  const { data } = await res.json()
  console.debug('[auth] refresh success')
  return data
}

export async function signOut() {
  console.debug('[auth] signout called')
  await fetch(`${BASE}/signout`, {
    method: 'POST',
    credentials: 'include',
  })
}
