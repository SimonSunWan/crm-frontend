import type { ApiResponse } from './tableCache'
export interface BaseRequestParams extends Api.Common.PaginatingParams {
  [key: string]: unknown
}

export interface TableError {
  code: string
  message: string
  details?: unknown
}

function extractRecords<T>(obj: Record<string, unknown>, fields: string[]): T[] {
  for (const field of fields) {
    if (field in obj && Array.isArray(obj[field])) {
      return obj[field] as T[]
    }
  }
  return []
}

function extractTotal(obj: Record<string, unknown>, records: unknown[], fields: string[]): number {
  for (const field of fields) {
    if (field in obj && typeof obj[field] === 'number') {
      return obj[field] as number
    }
  }
  return records.length
}

function extractPagination(
  obj: Record<string, unknown>,
  data?: Record<string, unknown>
): Pick<ApiResponse<unknown>, 'current' | 'size'> | undefined {
  const result: Partial<Pick<ApiResponse<unknown>, 'current' | 'size'>> = {}
  const sources = [obj, data ?? {}]

  const currentFields = ['current', 'page', 'pageNum']
  for (const src of sources) {
    for (const field of currentFields) {
      if (field in src && typeof src[field] === 'number') {
        result.current = src[field] as number
        break
      }
    }
    if (result.current !== undefined) break
  }

  const sizeFields = ['size', 'pageSize', 'limit']
  for (const src of sources) {
    for (const field of sizeFields) {
      if (field in src && typeof src[field] === 'number') {
        result.size = src[field] as number
        break
      }
    }
    if (result.size !== undefined) break
  }

  if (result.current === undefined && result.size === undefined) return undefined
  return result
}

export const defaultResponseAdapter = <T>(response: unknown): ApiResponse<T> => {
  if (!response) {
    return { records: [], total: 0 }
  }

  if (Array.isArray(response)) {
    return { records: response, total: response.length }
  }

  if (typeof response !== 'object') {
    return { records: [], total: 0 }
  }

  const res = response as Record<string, unknown>
  let records: T[] = []
  let total = 0
  let pagination: Pick<ApiResponse<unknown>, 'current' | 'size'> | undefined

  const recordFields = ['records', 'data', 'list', 'items', 'result']
  records = extractRecords(res, recordFields)
  total = extractTotal(res, records, ['total', 'count'])
  pagination = extractPagination(res)

  if (records.length === 0 && 'data' in res && typeof res.data === 'object') {
    const data = res.data as Record<string, unknown>
    records = extractRecords(data, ['list', 'records', 'items'])
    total = extractTotal(data, records, ['total', 'count'])
    pagination = extractPagination(res, data)

    if (Array.isArray(res.data)) {
      records = res.data as T[]
      total = records.length
    }
  }

  const result: ApiResponse<T> = { records, total }
  if (pagination) {
    Object.assign(result, pagination)
  }
  return result
}

export const extractTableData = <T>(response: ApiResponse<T>): T[] => {
  const data = response.records || response.data || []
  return Array.isArray(data) ? data : []
}

export const updatePaginationFromResponse = <T>(
  pagination: Api.Common.PaginatingParams,
  response: ApiResponse<T>
): void => {
  pagination.total = response.total ?? pagination.total ?? 0

  if (response.current !== undefined) {
    pagination.current = response.current
  }

  if (response.size !== undefined) {
    pagination.size = response.size
  }

  const maxPage = Math.max(1, Math.ceil(pagination.total / (pagination.size || 1)))
  if (pagination.current > maxPage) {
    pagination.current = maxPage
  }
}

export const createSmartDebounce = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  delay: number
): T & { cancel: () => void; flush: () => Promise<any> } => {
  let timeoutId: NodeJS.Timeout | null = null
  let lastArgs: Parameters<T> | null = null
  let lastResolve: ((value: any) => void) | null = null
  let lastReject: ((reason: any) => void) | null = null

  const debouncedFn = (...args: Parameters<T>): Promise<any> => {
    return new Promise((resolve, reject) => {
      if (timeoutId) clearTimeout(timeoutId)
      lastArgs = args
      lastResolve = resolve
      lastReject = reject
      timeoutId = setTimeout(async () => {
        try {
          const result = await fn(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          timeoutId = null
          lastArgs = null
          lastResolve = null
          lastReject = null
        }
      }, delay)
    })
  }

  debouncedFn.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId)
    timeoutId = null
    lastArgs = null
    lastResolve = null
    lastReject = null
  }

  debouncedFn.flush = async () => {
    if (timeoutId && lastArgs && lastResolve && lastReject) {
      clearTimeout(timeoutId)
      timeoutId = null
      const args = lastArgs
      const resolve = lastResolve
      const reject = lastReject
      lastArgs = null
      lastResolve = null
      lastReject = null
      try {
        const result = await fn(...args)
        resolve(result)
        return result
      } catch (error) {
        reject(error)
        throw error
      }
    }
    return Promise.resolve()
  }

  return debouncedFn as any
}

export const createErrorHandler = (
  onError?: (error: TableError) => void,
  enableLog: boolean = false
) => {
  const logger = {
    error: (message: string, ...args: any[]) => {
      if (enableLog) console.error(`[useTable] ${message}`, ...args)
    }
  }

  return (err: unknown, context: string): TableError => {
    const tableError: TableError = {
      code: 'UNKNOWN_ERROR',
      message: '未知错误',
      details: err
    }

    if (err instanceof Error) {
      tableError.message = err.message
      tableError.code = err.name
    } else if (typeof err === 'string') {
      tableError.message = err
    }

    logger.error(`${context}:`, err)
    onError?.(tableError)
    return tableError
  }
}
