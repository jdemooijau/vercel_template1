"use client"

import { useState, useEffect, useCallback } from "react"
import { getODataService, type ProjectMetadata, type ProcessStatus, type ApiError } from "@/lib/odata-service"

interface UseApiOptions {
  autoRefresh?: boolean
  refreshInterval?: number
  filter?: string
  orderBy?: string
  top?: number
  skip?: number
}

interface UseApiResult<T> {
  data: T[]
  loading: boolean
  error: ApiError | null
  refetch: () => Promise<void>
}

// Hook for projects
export function useProjects(options: UseApiOptions = {}) {
  const [projects, setProjects] = useState<ProjectMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const service = getODataService()
      const response = await service.getProjects({
        $filter: options.filter,
        $orderby: options.orderBy,
        $top: options.top,
        $skip: options.skip,
      })

      setProjects(response.value)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [options.filter, options.orderBy, options.top, options.skip])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchProjects, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [options.autoRefresh, options.refreshInterval, fetchProjects])

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
  }
}

// Hook for processes
export function useProcesses(options: UseApiOptions = {}) {
  const [processes, setProcesses] = useState<ProcessStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchProcesses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const service = getODataService()
      const response = await service.getActiveProcesses({
        $filter: options.filter,
        $orderby: options.orderBy,
        $top: options.top,
      })

      setProcesses(response.value)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [options.filter, options.orderBy, options.top])

  const cancelProcess = useCallback(
    async (processId: string) => {
      try {
        const service = getODataService()
        await service.cancelProcess(processId)
        await fetchProcesses() // Refresh the list
      } catch (err) {
        setError(err as ApiError)
      }
    },
    [fetchProcesses],
  )

  const retryProcess = useCallback(
    async (processId: string) => {
      try {
        const service = getODataService()
        await service.retryFailedProcess(processId)
        await fetchProcesses() // Refresh the list
      } catch (err) {
        setError(err as ApiError)
      }
    },
    [fetchProcesses],
  )

  useEffect(() => {
    fetchProcesses()
  }, [fetchProcesses])

  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchProcesses, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [options.autoRefresh, options.refreshInterval, fetchProcesses])

  return {
    processes,
    loading,
    error,
    refetch: fetchProcesses,
    cancelProcess,
    retryProcess,
  }
}

// Hook for queue files
export function useQueueFiles(options: UseApiOptions = {}) {
  const [queueFiles, setQueueFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchQueueFiles = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const service = getODataService()
      // Mock queue files data since the actual endpoint may not exist yet
      const mockQueueFiles = [
        {
          id: "1",
          filename: "customer_data.csv",
          status: "pending",
          size: 2048000,
          uploadedAt: new Date().toISOString(),
          priority: "high",
        },
        {
          id: "2",
          filename: "sales_report.xlsx",
          status: "processing",
          size: 5242880,
          uploadedAt: new Date(Date.now() - 3600000).toISOString(),
          priority: "medium",
        },
      ]

      setQueueFiles(mockQueueFiles)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [options.filter, options.orderBy, options.top, options.skip])

  useEffect(() => {
    fetchQueueFiles()
  }, [fetchQueueFiles])

  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchQueueFiles, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [options.autoRefresh, options.refreshInterval, fetchQueueFiles])

  return {
    files: queueFiles,
    loading,
    error,
    refetch: fetchQueueFiles,
  }
}

// Hook for data quality metrics
export function useDataQuality(options: UseApiOptions = {}) {
  const [dataQuality, setDataQuality] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<ApiError | null>(null)

  const fetchDataQuality = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const service = getODataService()
      // Mock data quality metrics since the actual endpoint may not exist yet
      const mockDataQuality = [
        {
          id: "1",
          filename: "customer_data.csv",
          qualityScore: 95.5,
          completeness: 98.2,
          accuracy: 94.1,
          consistency: 96.8,
          issues: [
            { type: "missing_values", count: 12, severity: "medium" },
            { type: "format_inconsistency", count: 3, severity: "low" },
          ],
          lastChecked: new Date().toISOString(),
        },
        {
          id: "2",
          filename: "sales_report.xlsx",
          qualityScore: 87.3,
          completeness: 91.5,
          accuracy: 89.2,
          consistency: 81.2,
          issues: [
            { type: "duplicate_records", count: 45, severity: "high" },
            { type: "invalid_dates", count: 8, severity: "medium" },
          ],
          lastChecked: new Date(Date.now() - 1800000).toISOString(),
        },
      ]

      setDataQuality(mockDataQuality)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setLoading(false)
    }
  }, [options.filter, options.orderBy, options.top, options.skip])

  useEffect(() => {
    fetchDataQuality()
  }, [fetchDataQuality])

  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(fetchDataQuality, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [options.autoRefresh, options.refreshInterval, fetchDataQuality])

  return {
    data: dataQuality,
    loading,
    error,
    refetch: fetchDataQuality,
  }
}
