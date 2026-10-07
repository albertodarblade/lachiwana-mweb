import { useCallback, useEffect, useRef } from 'react'

// Screen Wake Lock: keeps the phone screen on while the caller is active
// (e.g. the note editor). Falls back to a no-op when the API is unsupported
// (older iOS Safari) or the request is denied.
//
// The browser auto-releases the lock when the document becomes hidden, so we
// re-acquire on `visibilitychange` → visible. Callers should also call
// `release()` when the page stops being active (Framework7 fires
// `pageBeforeOut` even when pages stay mounted in the router stack).
export default function useWakeLock() {
  const lockRef = useRef(null)

  const release = useCallback(() => {
    const lock = lockRef.current
    lockRef.current = null
    lock?.release?.().catch(() => {})
  }, [])

  const acquire = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    if (lockRef.current) return
    try {
      const lock = await navigator.wakeLock.request('screen')
      lockRef.current = lock
      lock.addEventListener('release', () => {
        // Auto-released (tab hidden, etc.) — clear the ref so a later
        // acquire can take a fresh lock.
        if (lockRef.current === lock) lockRef.current = null
      })
    } catch (err) {
      console.debug('[wake-lock] request failed:', err)
      lockRef.current = null
    }
  }, [])

  useEffect(() => {
    // Acquire right away (covers the initial mount); belt-and-suspenders with
    // the F7 page events wired by the caller.
    acquire()

    function onVisibility() {
      if (document.visibilityState === 'visible') acquire()
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      release()
    }
  }, [acquire, release])

  return { acquire, release }
}