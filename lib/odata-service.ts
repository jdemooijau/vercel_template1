// OData API Service with authentication and error handling
export interface ODataResponse<T> {
  "@odata.context": string
  "@odata.count"?: number
  value: T[]
}

export interface ApiError {
  code: string
  message: string
  details?: string
  createdAt: string
}

export interface AuthConfig {
  baseUrl: string
  clientId: string
  clientSecret?: string
  tenantId?: string
  scope?: string
}

export interface ProjectMetadata {
  id: string
  name: string
  description: string
  domain: string
  owner: string
  status: "draft" | "active" | "processing" | "completed" | "failed"
  createdAt: string
  updatedAt: string
  sourceFormat: string
  targetFormat: string
  estimatedDuration?: number
  progress?: number
  metadata?: Record<string, any>
}

export interface ProcessStatus {
  id: string
  projectId: string
  type: "conversion" | "validation" | "transformation" | "quality_check"
  status: "queued" | "running" | "completed" | "failed" | "cancelled"
  progress: number
  startedAt: string
  completedAt?: string
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface QueueFile {
  id: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  status: "uploaded" | "queued" | "processing" | "completed" | "failed"
  projectId?: string
  uploadedAt: string
  processedAt?: string
  metadata?: Record<string, any>
}

export interface ConversionRequest {
  projectId: string
  sourceFiles: string[]
  targetFormat: string
  options?: Record<string, any>
}

export interface ValidationRequest {
  fileId: string
  validationType: "schema" | "quality" | "business_rules"
  rules?: Record<string, any>
}

export interface TransformationRequest {
  sourceFileId: string
  transformationRules: Array<{
    sourceField: string
    targetField: string
    transformation: string
    parameters?: Record<string, any>
  }>
  outputFormat: string
}

class ODataService {
  private baseUrl: string
  private authToken: string | null = null
  private authConfig: AuthConfig
  private tokenExpiry: Date | null = null

  constructor(authConfig: AuthConfig) {
    this.authConfig = authConfig
    this.baseUrl = authConfig.baseUrl.endsWith("/") ? authConfig.baseUrl.slice(0, -1) : authConfig.baseUrl
  }

  // Authentication Methods
  async authenticate(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: this.authConfig.clientId,
          client_secret: this.authConfig.clientSecret,
          tenant_id: this.authConfig.tenantId,
          scope: this.authConfig.scope || "api://data-platform/.default",
          grant_type: "client_credentials",
        }),
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.statusText}`)
      }

      const data = await response.json()
      this.authToken = data.access_token
      this.tokenExpiry = new Date(Date.now() + data.expires_in * 1000)
    } catch (error) {
      throw new Error(`Authentication error: ${(error as Error).message}`)
    }
  }

  private async ensureAuthenticated(): Promise<void> {
    if (!this.authToken || (this.tokenExpiry && this.tokenExpiry <= new Date())) {
      await this.authenticate()
    }
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    await this.ensureAuthenticated()

    const url = `${this.baseUrl}${endpoint}`
    const headers = {
      Authorization: `Bearer ${this.authToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "OData-Version": "4.0",
      ...options.headers,
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(
          errorData.code || response.status.toString(),
          errorData.message || response.statusText,
          errorData.details,
          new Date().toISOString(),
        )
      }

      return await response.json()
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        "NETWORK_ERROR",
        `Network request failed: ${(error as Error).message}`,
        undefined,
        new Date().toISOString(),
      )
    }
  }

  // 1. Generate Project Description/Metadata
  async generateProjectMetadata(
    sourceFiles: File[],
    options?: {
      domain?: string
      targetFormat?: string
      analysisDepth?: "basic" | "detailed" | "comprehensive"
    },
  ): Promise<ProjectMetadata> {
    const formData = new FormData()
    sourceFiles.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    if (options) {
      formData.append("options", JSON.stringify(options))
    }

    const response = await this.makeRequest<ProjectMetadata>("/api/projects/generate-metadata", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        // Don't set Content-Type for FormData
      },
      body: formData,
    })

    return response
  }

  // 2. Retrieve List of All Projects
  async getProjects(options?: {
    $filter?: string
    $orderby?: string
    $top?: number
    $skip?: number
    $expand?: string
  }): Promise<ODataResponse<ProjectMetadata>> {
    const params = new URLSearchParams()

    if (options?.$filter) params.append("$filter", options.$filter)
    if (options?.$orderby) params.append("$orderby", options.$orderby)
    if (options?.$top) params.append("$top", options.$top.toString())
    if (options?.$skip) params.append("$skip", options.$skip.toString())
    if (options?.$expand) params.append("$expand", options.$expand)

    const queryString = params.toString()
    const endpoint = `/api/projects${queryString ? `?${queryString}` : ""}`

    return await this.makeRequest<ODataResponse<ProjectMetadata>>(endpoint)
  }

  // Get single project by ID
  async getProject(projectId: string): Promise<ProjectMetadata> {
    return await this.makeRequest<ProjectMetadata>(`/api/projects('${projectId}')`)
  }

  // 3. Initiate Project Conversion Process
  async initiateConversion(request: ConversionRequest): Promise<ProcessStatus> {
    return await this.makeRequest<ProcessStatus>("/api/processes/conversion", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // 4. Add Files to Data Queue
  async addFilesToQueue(files: File[], projectId?: string, metadata?: Record<string, any>): Promise<QueueFile[]> {
    const formData = new FormData()

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })

    if (projectId) {
      formData.append("projectId", projectId)
    }

    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata))
    }

    const response = await this.makeRequest<{ value: QueueFile[] }>("/api/queue/files", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.authToken}`,
      },
      body: formData,
    })

    return response.value
  }

  // 5. Retrieve Target File After Conversion
  async getConvertedFile(processId: string, format?: "blob" | "url" | "metadata"): Promise<Blob | string | QueueFile> {
    const params = format ? `?format=${format}` : ""
    const endpoint = `/api/processes('${processId}')/output${params}`

    if (format === "blob") {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`)
      }

      return await response.blob()
    }

    return await this.makeRequest<string | QueueFile>(endpoint)
  }

  // 6. List All Active Processes and Their Statuses
  async getActiveProcesses(options?: {
    $filter?: string
    $orderby?: string
    $top?: number
  }): Promise<ODataResponse<ProcessStatus>> {
    const params = new URLSearchParams()

    // Default filter for active processes
    const activeFilter = "status in ('queued','running')"
    const combinedFilter = options?.$filter ? `(${activeFilter}) and (${options.$filter})` : activeFilter

    params.append("$filter", combinedFilter)

    if (options?.$orderby) params.append("$orderby", options.$orderby)
    if (options?.$top) params.append("$top", options.$top.toString())

    const queryString = params.toString()
    const endpoint = `/api/processes?${queryString}`

    return await this.makeRequest<ODataResponse<ProcessStatus>>(endpoint)
  }

  // Get all processes (not just active)
  async getAllProcesses(options?: {
    $filter?: string
    $orderby?: string
    $top?: number
    $skip?: number
  }): Promise<ODataResponse<ProcessStatus>> {
    const params = new URLSearchParams()

    if (options?.$filter) params.append("$filter", options.$filter)
    if (options?.$orderby) params.append("$orderby", options.$orderby)
    if (options?.$top) params.append("$top", options.$top.toString())
    if (options?.$skip) params.append("$skip", options.$skip.toString())

    const queryString = params.toString()
    const endpoint = `/api/processes${queryString ? `?${queryString}` : ""}`

    return await this.makeRequest<ODataResponse<ProcessStatus>>(endpoint)
  }

  // 7. List All Files in Data Queue
  async getQueueFiles(options?: {
    $filter?: string
    $orderby?: string
    $top?: number
    $skip?: number
  }): Promise<ODataResponse<QueueFile>> {
    const params = new URLSearchParams()

    if (options?.$filter) params.append("$filter", options.$filter)
    if (options?.$orderby) params.append("$orderby", options.$orderby)
    if (options?.$top) params.append("$top", options.$top.toString())
    if (options?.$skip) params.append("$skip", options.$skip.toString())

    const queryString = params.toString()
    const endpoint = `/api/queue/files${queryString ? `?${queryString}` : ""}`

    return await this.makeRequest<ODataResponse<QueueFile>>(endpoint)
  }

  // Additional Enhanced Services

  // Data Validation Service
  async validateData(request: ValidationRequest): Promise<{
    isValid: boolean
    errors: Array<{
      field: string
      message: string
      severity: "error" | "warning" | "info"
    }>
    qualityScore: number
    metadata: Record<string, any>
  }> {
    return await this.makeRequest("/api/validation/validate", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // Data Quality Assessment
  async assessDataQuality(
    fileId: string,
    options?: {
      includeProfiler?: boolean
      includeStatistics?: boolean
      customRules?: Array<{
        name: string
        expression: string
        severity: "error" | "warning"
      }>
    },
  ): Promise<{
    overallScore: number
    dimensions: {
      completeness: number
      accuracy: number
      consistency: number
      validity: number
      uniqueness: number
      timeliness: number
    }
    issues: Array<{
      dimension: string
      field: string
      issue: string
      severity: "high" | "medium" | "low"
      affectedRecords: number
    }>
    recommendations: string[]
    statistics?: Record<string, any>
  }> {
    const params = options ? `?${new URLSearchParams(options as any).toString()}` : ""
    return await this.makeRequest(`/api/quality/assess('${fileId}')${params}`)
  }

  // Automated Data Transformation
  async createTransformation(request: TransformationRequest): Promise<ProcessStatus> {
    return await this.makeRequest("/api/transformations", {
      method: "POST",
      body: JSON.stringify(request),
    })
  }

  // Schema Discovery and Mapping
  async discoverSchema(
    fileId: string,
    options?: {
      inferTypes?: boolean
      detectRelationships?: boolean
      suggestConstraints?: boolean
    },
  ): Promise<{
    schema: {
      fields: Array<{
        name: string
        type: string
        nullable: boolean
        constraints?: Record<string, any>
      }>
      relationships?: Array<{
        sourceField: string
        targetTable: string
        targetField: string
        type: "one-to-one" | "one-to-many" | "many-to-many"
      }>
    }
    confidence: number
    suggestions: string[]
  }> {
    const params = options ? `?${new URLSearchParams(options as any).toString()}` : ""
    return await this.makeRequest(`/api/schema/discover('${fileId}')${params}`)
  }

  // Data Lineage Tracking
  async getDataLineage(
    entityId: string,
    direction?: "upstream" | "downstream" | "both",
  ): Promise<{
    nodes: Array<{
      id: string
      name: string
      type: "file" | "table" | "view" | "process"
      metadata: Record<string, any>
    }>
    edges: Array<{
      source: string
      target: string
      type: "data_flow" | "transformation" | "dependency"
      metadata: Record<string, any>
    }>
  }> {
    const params = direction ? `?direction=${direction}` : ""
    return await this.makeRequest(`/api/lineage('${entityId}')${params}`)
  }

  // Data Catalog Integration
  async registerDataAsset(asset: {
    name: string
    description: string
    type: "dataset" | "table" | "file"
    schema: Record<string, any>
    tags: string[]
    owner: string
    steward?: string
    classification: "public" | "internal" | "confidential" | "restricted"
  }): Promise<{ id: string; catalogUrl: string }> {
    return await this.makeRequest("/api/catalog/assets", {
      method: "POST",
      body: JSON.stringify(asset),
    })
  }

  // Compliance and Governance
  async checkCompliance(
    fileId: string,
    regulations: string[],
  ): Promise<{
    compliant: boolean
    violations: Array<{
      regulation: string
      rule: string
      severity: "critical" | "high" | "medium" | "low"
      description: string
      remediation: string
    }>
    recommendations: string[]
  }> {
    return await this.makeRequest("/api/compliance/check", {
      method: "POST",
      body: JSON.stringify({ fileId, regulations }),
    })
  }

  // Data Profiling Service
  async profileData(
    fileId: string,
    options?: {
      sampleSize?: number
      includeDistributions?: boolean
      detectPatterns?: boolean
    },
  ): Promise<{
    summary: {
      totalRows: number
      totalColumns: number
      dataTypes: Record<string, number>
      nullPercentage: number
    }
    columns: Array<{
      name: string
      type: string
      nullCount: number
      uniqueCount: number
      min?: any
      max?: any
      mean?: number
      median?: number
      mode?: any
      distribution?: Record<string, number>
      patterns?: string[]
    }>
  }> {
    const params = options ? `?${new URLSearchParams(options as any).toString()}` : ""
    return await this.makeRequest(`/api/profiling/profile('${fileId}')${params}`)
  }

  // Real-time Monitoring
  async getSystemHealth(): Promise<{
    status: "healthy" | "degraded" | "unhealthy"
    services: Array<{
      name: string
      status: "up" | "down" | "degraded"
      responseTime: number
      lastCheck: string
    }>
    metrics: {
      activeProcesses: number
      queuedFiles: number
      errorRate: number
      throughput: number
    }
  }> {
    return await this.makeRequest("/api/monitoring/health")
  }

  // Batch Operations
  async createBatchOperation(
    operations: Array<{
      type: "convert" | "validate" | "transform" | "profile"
      parameters: Record<string, any>
    }>,
  ): Promise<{
    batchId: string
    operations: ProcessStatus[]
  }> {
    return await this.makeRequest("/api/batch/operations", {
      method: "POST",
      body: JSON.stringify({ operations }),
    })
  }

  // Error Recovery and Retry
  async retryFailedProcess(
    processId: string,
    options?: {
      maxRetries?: number
      retryDelay?: number
    },
  ): Promise<ProcessStatus> {
    return await this.makeRequest(`/api/processes('${processId}')/retry`, {
      method: "POST",
      body: JSON.stringify(options || {}),
    })
  }

  // Cancel running process
  async cancelProcess(processId: string): Promise<{ success: boolean; message: string }> {
    return await this.makeRequest(`/api/processes('${processId}')/cancel`, {
      method: "POST",
    })
  }
}

// Error handling utility
export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: string,
    public createdAt?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

// Service factory
export function createODataService(config: AuthConfig): ODataService {
  return new ODataService(config)
}

// Default service instance (to be configured in app initialization)
let defaultService: ODataService | null = null

export function initializeODataService(config: AuthConfig): void {
  defaultService = new ODataService(config)
}

export function getODataService(): ODataService {
  if (!defaultService) {
    throw new Error("OData service not initialized. Call initializeODataService first.")
  }
  return defaultService
}

// Utility functions for common OData operations
export const ODataUtils = {
  // Build filter expressions
  buildFilter: (conditions: Record<string, any>): string => {
    return Object.entries(conditions)
      .map(([key, value]) => {
        if (typeof value === "string") {
          return `${key} eq '${value}'`
        } else if (typeof value === "number") {
          return `${key} eq ${value}`
        } else if (Array.isArray(value)) {
          return `${key} in (${value.map((v) => (typeof v === "string" ? `'${v}'` : v)).join(",")})`
        }
        return `${key} eq ${value}`
      })
      .join(" and ")
  },

  // Build order by expressions
  buildOrderBy: (fields: Array<{ field: string; direction?: "asc" | "desc" }>): string => {
    return fields.map(({ field, direction = "asc" }) => `${field} ${direction}`).join(",")
  },

  // Format dates for OData
  formatDate: (date: Date): string => {
    return date.toISOString()
  },

  // Parse OData error responses
  parseError: (error: any): ApiError => {
    if (error instanceof ApiError) {
      return error
    }

    return new ApiError(
      "UNKNOWN_ERROR",
      error.message || "An unknown error occurred",
      error.stack,
      new Date().toISOString(),
    )
  },
}
