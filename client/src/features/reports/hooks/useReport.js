import { useCallback } from 'react';import useRemoteData from '../../../hooks/useRemoteData';import { getReport } from '../api/reportsApi'
export default function useReport(id){const loader=useCallback(async signal=>({data:await getReport(id,signal)}),[id]);return useRemoteData(loader,[loader],{enabled:Boolean(id)})}
