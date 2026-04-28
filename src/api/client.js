const BASE_URL = import.meta.env.LACHIWANA_SERVICE_URL

async function request(method, path) {
  const response = await fetch(`${BASE_URL}${path}`, { method })
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }
  return response.json()
}

export const get = (path) => request('GET', path)
