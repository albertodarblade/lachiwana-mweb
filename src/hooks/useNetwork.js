import { useState, useEffect } from 'react'
import { getNetworkStatus, subscribeToNetwork } from '../stores/networkStore'

export default function useNetwork() {
  const [status, setStatus] = useState(getNetworkStatus)

  useEffect(() => {
    const unsubscribe = subscribeToNetwork(setStatus)
    return unsubscribe
  }, [])

  return status
}
