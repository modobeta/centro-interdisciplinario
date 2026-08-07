import { useCallback, useEffect, useState } from 'react'
import { getPublicServices } from '../api/publicServicesApi'

export default function usePublicServices({ limit } = {}) {
  const [state, setState] = useState({ status: 'idle', data: [], error: null })
  const [version, setVersion] = useState(0)
  const retry = useCallback(() => setVersion((value) => value + 1), [])
  useEffect(() => { const controller = new AbortController(); setState((current) => ({ ...current, status: 'loading', error: null })); getPublicServices({ limit, signal: controller.signal }).then((data) => setState({ status: data.length ? 'success' : 'empty', data, error: null })).catch((error) => { if (!error.canceled && !controller.signal.aborted) setState({ status: 'error', data: [], error }) }); return () => controller.abort() }, [limit, version])
  return { ...state, retry }
}
