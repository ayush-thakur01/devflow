import { useCallback } from 'react'

const useOptimisticUpdate = (setData) => {
  const optimisticUpdate = useCallback((id, updater) => {
    setData(prev => prev.map(item => (item._id === id ? updater(item) : item)))
  }, [setData])

  const optimisticDelete = useCallback((id) => {
    setData(prev => prev.filter(item => item._id !== id))
  }, [setData])

  const optimisticAdd = useCallback((newItem) => {
    setData(prev => [newItem, ...prev])
  }, [setData])

  const optimisticReplace = useCallback((id, updatedItem) => {
    setData(prev => prev.map(item => (item._id === id ? updatedItem : item)))
  }, [setData])

  return { optimisticUpdate, optimisticDelete, optimisticAdd, optimisticReplace }
}

export default useOptimisticUpdate
