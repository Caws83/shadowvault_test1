import React, { useState, useEffect, useRef } from 'react'

const SFAST_INTERVAL = 10000
const FAST_INTERVAL = 20000
const SLOW_INTERVAL = 40000
const SSLOW_INTERVAL = 120000

const RefreshContext = React.createContext({ sslow: 0, slow: 0, fast: 0, sfast: 0 })

// Check if the tab is active in the user browser
const useIsBrowserTabActive = () => {
  const isBrowserTabActiveRef = useRef(true)

  useEffect(() => {
    const onVisibilityChange = () => {
      isBrowserTabActiveRef.current = !document.hidden
    }

    window.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      window.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return isBrowserTabActiveRef
}

// This context maintain 2 counters that can be used as a dependencies on other hooks to force a periodic refresh
const RefreshContextProvider = ({ children }) => {
  const [sslow, setSSlow] = useState(0)
  const [slow, setSlow] = useState(0)
  const [fast, setFast] = useState(0)
  const [sfast, setSFast] = useState(0)
  const isBrowserTabActiveRef = useIsBrowserTabActive()

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isBrowserTabActiveRef.current) {
        setFast((prev) => prev + 1)
      }
    }, FAST_INTERVAL)
    return () => clearInterval(interval)
  }, [isBrowserTabActiveRef])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isBrowserTabActiveRef.current) {
        setSlow((prev) => prev + 1)
      }
    }, SLOW_INTERVAL)
    return () => clearInterval(interval)
  }, [isBrowserTabActiveRef])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isBrowserTabActiveRef.current) {
        setSSlow((prev) => prev + 1)
      }
    }, SSLOW_INTERVAL)
    return () => clearInterval(interval)
  }, [isBrowserTabActiveRef])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isBrowserTabActiveRef.current) {
        setSFast((prev) => prev + 1)
      }
    }, SFAST_INTERVAL)
    return () => clearInterval(interval)
  }, [isBrowserTabActiveRef])

  return <RefreshContext.Provider value={{ sslow, slow, fast, sfast }}>{children}</RefreshContext.Provider>
}

export { RefreshContext, RefreshContextProvider }
