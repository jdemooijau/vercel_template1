// Conversion tracking types for database and UI
export interface ConversionRun {
  id: string
  projectId?: string
  userId: string
  runType: "manual" | "api" | "scheduled" | "batch"
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  startedAt: string
  completedAt?: string
  duration?: number // in milliseconds

  // Configuration
  sourceFormat: string
  targetFormat: string
  conversionOptions: Record<string, any>

  // Metrics
  totalFiles: number
  processedFiles: number
  failedFiles: number
  totalSizeBytes: number
  processedSizeBytes: number

  // Results
  successRate: number
  errorCount: number
  warningCount: number

  // Metadata
  metadata: Record<string, any>
  tags?: string[]

  createdAt: string
  updatedAt: string
}

export interface ConversionFile {
  id: string
  runId: string
  fileType: "input" | "output" | "intermediate" | "log"
  filename: string
  originalName: string
  filePath: string
  mimeType: string
  sizeBytes: number
  checksum?: string

  // Processing info
  status: "pending" | "processing" | "completed" | "failed" | "skipped"
  processedAt?: string
  processingDuration?: number

  // File metadata
  schema?: Record<string, any>
  rowCount?: number
  columnCount?: number
  quality?: {
    score: number
    issues: Array<{
      type: string
      severity: "error" | "warning" | "info"
      message: string
      count: number
    }>
  }

  createdAt: string
  updatedAt: string
}

export interface ConversionError {
  id: string
  runId: string
  fileId?: string
  errorType: "validation" | "transformation" | "system" | "network" | "timeout" | "memory"
  severity: "critical" | "error" | "warning" | "info"

  // Error details
  errorCode: string
  message: string
  stackTrace?: string
  context?: Record<string, any>

  // Location info
  step?: string
  lineNumber?: number
  columnNumber?: number
  fieldName?: string

  // Resolution
  isResolved: boolean
  resolution?: string
  resolvedAt?: string
  resolvedBy?: string

  createdAt: string
}

export interface ConversionLog {
  id: string
  runId: string
  fileId?: string
  level: "debug" | "info" | "warn" | "error" | "fatal"
  category: "system" | "validation" | "transformation" | "performance" | "user"

  message: string
  details?: Record<string, any>
  timestamp: string

  // Performance metrics
  memoryUsage?: number
  cpuUsage?: number
  duration?: number

  // Context
  step?: string
  component?: string
  userId?: string
}

export interface ConversionMetrics {
  runId: string

  // Performance metrics
  totalDuration: number
  avgFileProcessingTime: number
  peakMemoryUsage: number
  avgCpuUsage: number

  // Throughput metrics
  filesPerSecond: number
  bytesPerSecond: number
  rowsPerSecond?: number

  // Quality metrics
  dataQualityScore: number
  validationErrors: number
  transformationWarnings: number

  // Resource usage
  diskSpaceUsed: number
  networkBytesTransferred: number

  createdAt: string
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
        Insert: Omit<ConversionRun, "id" | "createdAt" | "updatedAt">
        Update: Partial<Omit<ConversionRun, "id" | "createdAt">>
      }
      conversion_files: {
        Row: ConversionFile
        Insert: Omit<ConversionFile, "id" | "createdAt" | "updatedAt">
        Update: Partial<Omit<ConversionFile, "id" | "createdAt">>
      }
      conversion_errors: {
        Row: ConversionError
        Insert: Omit<ConversionError, "id" | "createdAt">
        Update: Partial<Omit<ConversionError, "id" | "createdAt">>
      }
      conversion_logs: {
        Row: ConversionLog
        Insert: Omit<ConversionLog, "id">
        Update: Partial<ConversionLog>
      }
      conversion_metrics: {
        Row: ConversionMetrics
        Insert: Omit<ConversionMetrics, "createdAt">
        Update: Partial<ConversionMetrics>
      }
    }
  }
}
