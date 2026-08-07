import { useEffect } from 'react'

export default function useUnsavedChanges(isDirty) {
  useEffect(() => {
    if (!isDirty) return undefined
    const handler = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])
}
