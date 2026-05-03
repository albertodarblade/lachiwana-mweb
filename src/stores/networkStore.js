let state = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  justReconnected: false,
}

const listeners = new Set()

function notify() {
  listeners.forEach((cb) => cb({ ...state }))
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    state = { isOnline: true, justReconnected: true }
    notify()
  })

  window.addEventListener('offline', () => {
    state = { isOnline: false, justReconnected: false }
    notify()
  })
}

export function getNetworkStatus() {
  return { ...state }
}

export function clearReconnected() {
  state = { ...state, justReconnected: false }
  notify()
}

export function subscribeToNetwork(callback) {
  listeners.add(callback)
  return () => listeners.delete(callback)
}
