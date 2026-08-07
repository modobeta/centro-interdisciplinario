import { useCallback } from 'react'
import useRemoteData from '../../../hooks/useRemoteData'
import { getSummary } from '../api/dashboardApi'

export default function useDashboard() {
  const loader = useCallback(async (signal) => ({ data: await getSummary(signal) }), [])
  return useRemoteData(loader, [loader])
}
