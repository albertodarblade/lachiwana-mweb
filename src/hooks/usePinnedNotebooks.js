import { useState } from 'react'
import { getPins, pinNotebook as storePinNotebook, unpinNotebook as storeUnpinNotebook } from '../stores/pinStore'

export function usePinnedNotebooks(userId) {
  const [pins, setPins] = useState(() => getPins(userId))

  function pinNotebook(notebookId) {
    storePinNotebook(userId, notebookId)
    setPins(getPins(userId))
  }

  function unpinNotebook(notebookId) {
    storeUnpinNotebook(userId, notebookId)
    setPins(getPins(userId))
  }

  function isPinned(notebookId) {
    return pins.some(p => p.notebookId === notebookId)
  }

  return { pins, pinNotebook, unpinNotebook, isPinned }
}
