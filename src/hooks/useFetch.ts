import { useState, useEffect, useCallback } from 'react'
import { unstable_batchedUpdates as batch } from 'react-dom'
import { camelCasedKeys as toCamelCasedKeys } from 'frontend-essentials'

export type UseFetchRequestConfig = {
  manual?: boolean
  keepPreviousData?: boolean
  camelCasedKeys?: boolean
  onSuccess?: (res: { status: number; data?: any }) => void
  onError?: (res: { status?: number; error: Error | Error; data?: any }) => void
}

export type UseFetchResponse = {
  loading: boolean
  status?: number
  error?: any
  data?: any
  activate: (config?: UseFetchRequestConfig) => Promise<void>
}

const useFetch = (
  url: string,
  {
    manual,
    keepPreviousData,
    camelCasedKeys,
    onSuccess: initialOnSuccess,
    onError: initialOnError,
    ...initialOptions
  }: UseFetchRequestConfig = {}
): UseFetchResponse => {
  const [loading, setLoading] = useState(!manual)
  const [status, setStatus] = useState<number | undefined>()
  const [error, setError] = useState<number | undefined>()
  const [data, setData] = useState<number | undefined>()

  useEffect(() => {
    if (!manual) fetchData()
  }, [manual])

  const fetchData = useCallback(async ({ onSuccess = initialOnSuccess, onError = initialOnError, ...options } = {}) => {
    setLoading(true)
    setStatus(undefined)
    setError(undefined)
    if (!keepPreviousData) setData(undefined)

    try {
      const res = await fetch(url, {
        ...initialOptions,
        ...options
      })

      const data = await res.json()

      onSuccess?.({ status: res.status, data: camelCasedKeys ? toCamelCasedKeys(data) : data })

      batch(() => {
        setLoading(false)
        setStatus(status)
        setData(camelCasedKeys ? toCamelCasedKeys(data) : data)
      })
    } catch (error: any) {
      const status = error.response?.status

      onError?.({ status, error })

      batch(() => {
        setLoading(false)
        setStatus(status)
        setError(error)
      })
    }
  }, [])

  return { loading, status, error, data, activate: fetchData }
}

export default useFetch
