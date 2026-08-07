import { useCallback, useEffect, useRef, useState } from 'react'

export default function useRemoteData(loader, dependencies = [], { enabled = true, initialData = null } = {}) {
  const [state, setState] = useState({ status: 'idle', data: initialData, meta: null, error: null, refreshing: false })
  const requestId = useRef(0)
  const load = useCallback(async ({ refresh = false } = {}) => {
    if (!enabled) return
    const current = ++requestId.current
    const controller = new AbortController()
    setState((previous) => ({ ...previous, status: refresh && previous.data ? previous.status : 'loading', refreshing: refresh, error: null }))
    try {
      const result = await loader(controller.signal)
      if (current !== requestId.current) return
      const empty = Array.isArray(result.data) && result.data.length === 0
      setState({ status: empty ? 'empty' : 'success', data: result.data, meta: result.meta || null, error: null, refreshing: false })
    } catch (error) {
      if (current !== requestId.current || error.canceled) return
      setState((previous) => ({ ...previous, status: 'error', error, refreshing: false }))
    }
    return () => controller.abort()
  }, [enabled, loader])
  const refresh = useCallback(() => load({ refresh: true }), [load])
  useEffect(() => { const controller = new AbortController(); const current = ++requestId.current; if (!enabled) return undefined; setState((previous) => ({ ...previous, status: 'loading', error: null })); loader(controller.signal).then((result) => { if (current !== requestId.current) return; const empty = Array.isArray(result.data) && result.data.length === 0; setState({ status: empty ? 'empty' : 'success', data: result.data, meta: result.meta || null, error: null, refreshing: false }) }).catch((error) => { if (current === requestId.current && !error.canceled) setState((previous) => ({ ...previous, status: 'error', error, refreshing: false })) }); return () => controller.abort() }, dependencies) // eslint-disable-line react-hooks/exhaustive-deps
  return { ...state, refresh }
}
