import { useCallback } from 'react';import useRemoteData from '../../../hooks/useRemoteData';import { listConversations } from '../api/messagesApi'
export default function useConversations(params={}){const loader=useCallback(signal=>listConversations(params,signal),[params]);return useRemoteData(loader,[loader])}
