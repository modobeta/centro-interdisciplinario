import { useCallback } from 'react';import useRemoteData from '../../../hooks/useRemoteData';import { listUsers } from '../api/usersApi'
export default function useUsers(params){const loader=useCallback(signal=>listUsers(params,signal),[params]);return useRemoteData(loader,[loader])}
