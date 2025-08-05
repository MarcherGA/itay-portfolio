import { useMemo } from 'react'
import data from '../data/data'

function getNested(obj: any, path: string, defaultValue: any = ''): any {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object' && part in acc) {
      return acc[part]
    }
    return defaultValue
  }, obj)
}

export function useRawData(key: string | undefined) {
  const response = useMemo(() => {
    return key ? getNested(data, key) : data
  }, [key])

  return response
}
