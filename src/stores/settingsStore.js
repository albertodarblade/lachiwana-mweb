const PREFS_PREFIX = 'lachiwana_prefs_'
const DEFAULTS = { theme: 'ios', colorScheme: 'light' }

export function getPrefs(userId) {
  try {
    const raw = localStorage.getItem(`${PREFS_PREFIX}${userId}`)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed ?? { ...DEFAULTS }
  } catch {
    return { ...DEFAULTS }
  }
}

export function setPrefs(userId, prefs) {
  try {
    localStorage.setItem(`${PREFS_PREFIX}${userId}`, JSON.stringify(prefs))
  } catch {
    // storage errors are silently swallowed
  }
  applyPrefs(prefs)
}

export function applyPrefs(prefs) {
  const cl = document.documentElement.classList
  cl.remove('ios', 'md')
  cl.add(prefs.theme)
  if (prefs.colorScheme === 'dark') {
    cl.add('dark')
  } else {
    cl.remove('dark')
  }
}
