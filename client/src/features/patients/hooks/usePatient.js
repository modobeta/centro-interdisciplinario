import { useCallback } from 'react'
import useRemoteData from '../../../hooks/useRemoteData'
import { getPatient } from '../api/patientsApi'
export default function usePatient(id) { const loader = useCallback(async (signal) => ({ data: await getPatient(id, signal) }), [id]); return useRemoteData(loader, [loader], { enabled: Boolean(id) }) }
