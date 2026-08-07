import { useCallback } from 'react';import useRemoteData from '../../../hooks/useRemoteData';import { listUsers } from '../api/usersApi'
export default function useUserDirectory(search=''){const loader=useCallback(signal=>listUsers({view:'directory',search,limit:50},signal),[search]);return useRemoteData(loader,[loader])}
