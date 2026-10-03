import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const useApiCall = (url, options) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const opts = options || {}
  const method = opts.method || 'GET'
  const body = opts.body !== undefined ? opts.body : null
  const immediate = opts.immediate !== undefined ? opts.immediate : true

  const execute = useCallback(async (overrideUrl?, overrideBody?) => {
    setLoading(true)
    setError('')
    try {
      let response
      const targetUrl = overrideUrl || url
      const targetBody = overrideBody ?? body

      switch (method.toUpperCase()) {
        case 'GET':
          response = await api.get(targetUrl)
          break
        case 'POST':
          response = await api.post(targetUrl, targetBody)
          break
        case 'PUT':
          response = await api.put(targetUrl, targetBody)
          break
        case 'DELETE':
          response = await api.delete(targetUrl)
          break
        default:
          response = await api.get(targetUrl)
      }

      setData(response.data.data)
      return response.data.data
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong'
      setError(message)
      throw err
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, method, body])

  useEffect(() => {
    if (immediate && url) {
      execute()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [immediate])

  return { data, loading, error, setError, execute, setData }
}

export default useApiCall
