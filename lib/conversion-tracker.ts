import { createClient } from "@supabase/supabase-js"
import type {
  ConversionRun,
  ConversionFile,
  ConversionError,
  ConversionLog,
  ConversionMetrics,
  RunFilter,
  RunSummary,
} from "@/types/conversion-tracking"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export class ConversionTracker {
  // Create a new conversion run
  async createRun(runData: Omit<ConversionRun, "id" | "created_at" | "updated_at">): Promise<ConversionRun> {
    const { data, error } = await supabase
      .from("conversion_runs")
      .insert({
        ...runData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create conversion run: ${error.message}`)
    }

    return data
  }

  // Update run status and metrics
  async updateRun(runId: string, updates: Partial<ConversionRun>): Promise<ConversionRun> {
    const { data, error } = await supabase
      .from("conversion_runs")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", runId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update conversion run: ${error.message}`)
    }

    return data
  }

  // Complete a run with final metrics
  async completeRun(
    runId: string,
    status: "completed" | "failed" | "cancelled",
    finalMetrics?: Partial<ConversionRun>,
  ): Promise<ConversionRun> {
    const completedAt = new Date().toISOString()
    const run = await this.getRun(runId)
    const duration = new Date(completedAt).getTime() - new Date(run.started_at).getTime()

    return this.updateRun(runId, {
      status,
      completed_at: completedAt,
      duration,
      ...finalMetrics,
    })
  }

  // Add file to run
  async addFile(fileData: Omit<ConversionFile, "id" | "created_at" | "updated_at">): Promise<ConversionFile> {
    const { data, error } = await supabase
      .from("conversion_files")
      .insert({
        ...fileData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add file to run: ${error.message}`)
    }

    return data
  }

  // Update file status
  async updateFile(fileId: string, updates: Partial<ConversionFile>): Promise<ConversionFile> {
    const { data, error } = await supabase
      .from("conversion_files")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", fileId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update file: ${error.message}`)
    }

    return data
  }

  // Log an error
  async logError(errorData: Omit<ConversionError, "id" | "created_at">): Promise<ConversionError> {
    const { data, error } = await supabase
      .from("conversion_errors")
      .insert({
        ...errorData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to log error: ${error.message}`)
    }

    // Update run error count
    await this.incrementRunErrorCount(errorData.run_id)

    return data
  }

  // Add log entry
  async addLog(logData: Omit<ConversionLog, "id">): Promise<ConversionLog> {
    const { data, error } = await supabase.from("conversion_logs").insert(logData).select().single()

    if (error) {
      throw new Error(`Failed to add log entry: ${error.message}`)
    }

    return data
  }

  // Save performance metrics
  async saveMetrics(metricsData: Omit<ConversionMetrics, "created_at">): Promise<ConversionMetrics> {
    const { data, error } = await supabase
      .from("conversion_metrics")
      .insert({
        ...metricsData,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to save metrics: ${error.message}`)
    }

    return data
  }

  // Get single run with details
  async getRun(runId: string): Promise<ConversionRun> {
    const { data, error } = await supabase.from("conversion_runs").select("*").eq("id", runId).single()

    if (error) {
      throw new Error(`Failed to get run: ${error.message}`)
    }

    return data
  }

  // Get runs with filtering and pagination
  async getRuns(filter?: RunFilter, limit = 50, offset = 0): Promise<{ runs: ConversionRun[]; total: number }> {
    let query = supabase
      .from("conversion_runs")
      .select("*", { count: "exact" })
      .order("started_at", { ascending: false })

    // Apply filters
    if (filter) {
      if (filter.status?.length) {
        query = query.in("status", filter.status)
      }
      if (filter.runType?.length) {
        query = query.in("run_type", filter.runType)
      }
      if (filter.userId) {
        query = query.eq("user_id", filter.userId)
      }
      if (filter.projectId) {
        query = query.eq("project_id", filter.projectId)
      }
      if (filter.dateRange) {
        query = query.gte("started_at", filter.dateRange.start).lte("started_at", filter.dateRange.end)
      }
      if (filter.hasErrors !== undefined) {
        if (filter.hasErrors) {
          query = query.gt("error_count", 0)
        } else {
          query = query.eq("error_count", 0)
        }
      }
      if (filter.minDuration) {
        query = query.gte("duration", filter.minDuration)
      }
      if (filter.maxDuration) {
        query = query.lte("duration", filter.maxDuration)
      }
    }

    const { data, error, count } = await query.range(offset, offset + limit - 1)

    if (error) {
      throw new Error(`Failed to get runs: ${error.message}`)
    }

    return {
      runs: data || [],
      total: count || 0,
    }
  }

  // Get files for a run
  async getRunFiles(runId: string): Promise<ConversionFile[]> {
    const { data, error } = await supabase
      .from("conversion_files")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: true })

    if (error) {
      throw new Error(`Failed to get run files: ${error.message}`)
    }

    return data || []
  }

  // Get errors for a run
  async getRunErrors(runId: string): Promise<ConversionError[]> {
    const { data, error } = await supabase
      .from("conversion_errors")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: false })

    if (error) {
      throw new Error(`Failed to get run errors: ${error.message}`)
    }

    return data || []
  }

  // Get logs for a run
  async getRunLogs(runId: string, level?: string, limit = 1000): Promise<ConversionLog[]> {
    let query = supabase
      .from("conversion_logs")
      .select("*")
      .eq("run_id", runId)
      .order("timestamp", { ascending: false })
      .limit(limit)

    if (level) {
      query = query.eq("level", level)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get run logs: ${error.message}`)
    }

    return data || []
  }

  // Get metrics for a run
  async getRunMetrics(runId: string): Promise<ConversionMetrics | null> {
    const { data, error } = await supabase.from("conversion_metrics").select("*").eq("run_id", runId).single()

    if (error && error.code !== "PGRST116") {
      // Not found error
      throw new Error(`Failed to get run metrics: ${error.message}`)
    }

    return data
  }

  // Get summary statistics
  async getSummary(filter?: RunFilter): Promise<RunSummary> {
    let query = supabase
      .from("conversion_runs")
      .select("status, duration, total_files, processed_size_bytes, success_rate, error_count")

    // Apply same filters as getRuns
    if (filter) {
      if (filter.status?.length) {
        query = query.in("status", filter.status)
      }
      if (filter.runType?.length) {
        query = query.in("run_type", filter.runType)
      }
      if (filter.userId) {
        query = query.eq("user_id", filter.userId)
      }
      if (filter.projectId) {
        query = query.eq("project_id", filter.projectId)
      }
      if (filter.dateRange) {
        query = query.gte("started_at", filter.dateRange.start).lte("started_at", filter.dateRange.end)
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to get summary: ${error.message}`)
    }

    const runs = data || []
    const totalRuns = runs.length
    const successfulRuns = runs.filter((r) => r.status === "completed").length
    const failedRuns = runs.filter((r) => r.status === "failed").length
    const avgDuration = runs.reduce((sum, r) => sum + (r.duration || 0), 0) / totalRuns || 0
    const totalFilesProcessed = runs.reduce((sum, r) => sum + r.total_files, 0)
    const totalDataProcessed = runs.reduce((sum, r) => sum + (r.processed_size_bytes || 0), 0)
    const errorRate = totalRuns > 0 ? failedRuns / totalRuns : 0
    const avgSuccessRate = runs.reduce((sum, r) => sum + r.success_rate, 0) / totalRuns || 0

    return {
      totalRuns,
      successfulRuns,
      failedRuns,
      avgDuration,
      totalFilesProcessed,
      totalDataProcessed,
      errorRate,
      avgSuccessRate,
    }
  }

  // Helper methods
  private async incrementRunErrorCount(runId: string): Promise<void> {
    const { error } = await supabase.rpc("increment_error_count", { run_id: runId })

    if (error) {
      console.error("Failed to increment error count:", error)
    }
  }

  // Real-time subscriptions
  subscribeToRunUpdates(runId: string, callback: (run: ConversionRun) => void) {
    return supabase
      .channel(`run-${runId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversion_runs",
          filter: `id=eq.${runId}`,
        },
        (payload) => callback(payload.new as ConversionRun),
      )
      .subscribe()
  }

  subscribeToRunLogs(runId: string, callback: (log: ConversionLog) => void) {
    return supabase
      .channel(`logs-${runId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversion_logs",
          filter: `run_id=eq.${runId}`,
        },
        (payload) => callback(payload.new as ConversionLog),
      )
      .subscribe()
  }
}

// Singleton instance
export const conversionTracker = new ConversionTracker()

// Utility functions for common operations
export const ConversionUtils = {
  formatDuration: (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`
    } else {
      return `${seconds}s`
    }
  },

  formatFileSize: (bytes: number): string => {
    const units = ["B", "KB", "MB", "GB", "TB"]
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  },

  getStatusColor: (status: string): string => {
    switch (status) {
      case "completed":
        return "green"
      case "running":
        return "blue"
      case "queued":
        return "yellow"
      case "failed":
        return "red"
      case "cancelled":
        return "gray"
      default:
        return "gray"
    }
  },

  getSeverityColor: (severity: string): string => {
    switch (severity) {
      case "critical":
        return "red"
      case "error":
        return "red"
      case "warning":
        return "yellow"
      case "info":
        return "blue"
      default:
        return "gray"
    }
  },
}
