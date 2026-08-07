import { useCallback } from 'react';import useRemoteData from '../../../hooks/useRemoteData';import { listAudit } from '../api/auditApi'
export default function useAudit(params){const loader=useCallback(signal=>listAudit(params,signal),[params]);return useRemoteData(loader,[loader])}
