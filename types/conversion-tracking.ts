// Conversion tracking types for database and UI
export interface ConversionRun {
  id: string
  project_id?: string
  user_id: string
  run_type: "manual" | "api" | "scheduled" | "batch"
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  started_at: string
  completed_at?: string
  duration?: number // in milliseconds

  // Configuration
  source_format: string
  target_format: string
  conversion_options: Record<string, any>

  // Metrics
  total_files: number
  processed_files: number
  failed_files: number
  total_size_bytes: number
  processed_size_bytes: number

  // Results
  success_rate: number
  error_count: number
  warning_count: number

  // Metadata
  metadata: Record<string, any>
  tags?: string[]

  created_at: string
  updated_at: string
}

export interface ConversionFile {
  id: string
  run_id: string
  file_type: "input" | "output" | "intermediate" | "log"
  filename: string
  original_name: string
  file_path: string
  mime_type: string
  size_bytes: number
  checksum?: string

  // Processing info
  status: "pending" | "processing" | "completed" | "failed" | "skipped"
  processed_at?: string
  processing_duration?: number

  // File metadata
  schema?: Record<string, any>
  row_count?: number
  column_count?: number
  quality?: {
    score: number
    issues: Array<{
      type: string
      severity: "error" | "warning" | "info"
      message: string
      count: number
    }>
  }

  created_at: string
  updated_at: string
}

export interface ConversionError {
  id: string
  run_id: string
  file_id?: string
  error_type: "validation" | "transformation" | "system" | "network" | "timeout" | "memory"
  severity: "critical" | "error" | "warning" | "info"

  // Error details
  error_code: string
  message: string
  stack_trace?: string
  context?: Record<string, any>

  // Location info
  step?: string
  line_number?: number
  column_number?: number
  field_name?: string

  // Resolution
  is_resolved: boolean
  resolution?: string
  resolved_at?: string
  resolved_by?: string

  created_at: string
}

export interface ConversionLog {
  id: string
  run_id: string
  file_id?: string
  level: "debug" | "info" | "warn" | "error" | "fatal"
  category: "system" | "validation" | "transformation" | "performance" | "user"

  message: string
  details?: Record<string, any>
  timestamp: string

  // Performance metrics
  memory_usage?: number
  cpu_usage?: number
  duration?: number

  // Context
  step?: string
  component?: string
  user_id?: string
}

export interface ConversionMetrics {
  run_id: string

  // Performance metrics
  total_duration: number
  avg_file_processing_time: number
  peak_memory_usage: number
  avg_cpu_usage: number

  // Throughput metrics
  files_per_second: number
  bytes_per_second: number
  rows_per_second?: number

  // Quality metrics
  data_quality_score: number
  validation_errors: number
  transformation_warnings: number

  // Resource usage
  disk_space_used: number
  network_bytes_transferred: number

  created_at: string
}

// Dashboard filter and search types
export interface RunFilter {
  status?: string[]
  runType?: string[]
  userId?: string
  projectId?: string
  dateRange?: {
    start: string
    end: string
  }
  tags?: string[]
  hasErrors?: boolean
  minDuration?: number
  maxDuration?: number
}

export interface RunSummary {
  totalRuns: number
  successfulRuns: number
  failedRuns: number
  avgDuration: number
  totalFilesProcessed: number
  totalDataProcessed: number
  errorRate: number
  avgSuccessRate: number
}

// Database schema extensions
export interface Database {
  public: {
    Tables: {
      conversion_runs: {
        Row: ConversionRun
        Insert: Omit<ConversionRun, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<ConversionRun, "id" | "created_at">>
      }
      conversion_files: {
        Row: ConversionFile
        Insert: Omit<ConversionFile, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<ConversionFile, "id" | "created_at">>
      }
      conversion_errors: {
        Row: ConversionError
        Insert: Omit<ConversionError, "id" | "created_at">
        Update: Partial<Omit<ConversionError, "id" | "created_at">>
      }
      conversion_logs: {
        Row: ConversionLog
        Insert: Omit<ConversionLog, "id">
        Update: Partial<ConversionLog>
      }
      conversion_metrics: {
        Row: ConversionMetrics
        Insert: Omit<ConversionMetrics, "created_at">
        Update: Partial<ConversionMetrics>
      }
    }
  }
}
