import { useCallback } from 'react';import useRemoteData from '../../../hooks/useRemoteData';import { listServices } from '../api/servicesApi'
export default function useServices(params={}){const loader=useCallback(signal=>listServices(params,signal),[params]);return useRemoteData(loader,[loader])}
