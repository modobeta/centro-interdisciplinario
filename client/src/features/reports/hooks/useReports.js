import { useCallback } from 'react';import useRemoteData from '../../../hooks/useRemoteData';import { listReports } from '../api/reportsApi'
export default function useReports(params){const loader=useCallback(signal=>listReports(params,signal),[params]);return useRemoteData(loader,[loader])}
