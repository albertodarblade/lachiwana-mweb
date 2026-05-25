const PINS_PREFIX = 'lachiwana_pins_'

export function getPins(userId) {
  try {
    const raw = localStorage.getItem(`${PINS_PREFIX}${userId}`)
    const parsed = raw ? JSON.parse(raw) : null
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function pinNotebook(userId, notebookId) {
  try {
    const pins = getPins(userId).filter(p => p.notebookId !== notebookId)
    pins.push({ notebookId, pinnedDate: new Date().toISOString() })
    localStorage.setItem(`${PINS_PREFIX}${userId}`, JSON.stringify(pins))
  } catch {
    // storage errors swallowed silently
  }
}

export function unpinNotebook(userId, notebookId) {
  try {
    const pins = getPins(userId).filter(p => p.notebookId !== notebookId)
    localStorage.setItem(`${PINS_PREFIX}${userId}`, JSON.stringify(pins))
  } catch {
    // storage errors swallowed silently
  }
}
