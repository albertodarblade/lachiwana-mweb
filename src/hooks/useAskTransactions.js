import { useState, useRef, useEffect, useCallback } from 'react'
import { askTransactions } from '../api/ai'

export function useAskTransactions() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    return () => abortRef.current?.abort()
  }, [])

  const ask = useCallback(async ({ notebookId, question, from, to, onChunk, onDone }) => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    setError(null)
    setIsStreaming(true)
    try {
      await askTransactions(notebookId, {
        question,
        from,
        to,
        onChunk,
        onDone,
        signal: controller.signal,
      })
    } catch (err) {
      if (err?.name === 'AbortError') return
      setError(err)
      throw err
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null
        setIsStreaming(false)
      }
    }
  }, [])

  return { ask, isStreaming, error }
}