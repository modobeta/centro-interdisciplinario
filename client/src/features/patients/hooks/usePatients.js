import { useCallback } from 'react'
import useRemoteData from '../../../hooks/useRemoteData'
import { listPatients } from '../api/patientsApi'
export default function usePatients(params) { const loader = useCallback((signal) => listPatients(params, signal), [params]); return useRemoteData(loader, [loader]) }
