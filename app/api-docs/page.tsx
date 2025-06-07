"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  Book,
  Code,
  Zap,
  Shield,
  Database,
  Activity,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"

interface ApiEndpoint {
  id: string
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
  path: string
  title: string
  description: string
  category: string
  parameters?: Array<{
    name: string
    type: string
    required: boolean
    description: string
    example?: any
  }>
  requestBody?: {
    type: string
    description: string
    example: any
  }
  responses: Array<{
    status: number
    description: string
    example: any
  }>
  examples?: Array<{
    title: string
    description: string
    request: any
    response: any
  }>
}

const apiEndpoints: ApiEndpoint[] = [
  // Authentication
  {
    id: "auth-token",
    method: "POST",
    path: "/auth/token",
    title: "Authenticate",
    description: "Obtain an access token for API authentication using OAuth 2.0 client credentials flow",
    category: "Authentication",
    requestBody: {
      type: "application/json",
      description: "Authentication credentials",
      example: {
        client_id: "your-client-id",
        client_secret: "your-client-secret",
        tenant_id: "your-tenant-id",
        scope: "api://data-platform/.default",
        grant_type: "client_credentials",
      },
    },
    responses: [
      {
        status: 200,
        description: "Authentication successful",
        example: {
          access_token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...",
          token_type: "Bearer",
          expires_in: 3600,
          scope: "api://data-platform/.default",
        },
      },
      {
        status: 401,
        description: "Authentication failed",
        example: {
          error: "invalid_client",
          error_description: "Invalid client credentials",
        },
      },
    ],
  },

  // Core Operations
  {
    id: "generate-metadata",
    method: "POST",
    path: "/api/projects/generate-metadata",
    title: "Generate Project Metadata",
    description:
      "Analyze uploaded files and generate comprehensive project metadata including schema, statistics, and recommendations",
    category: "Core Operations",
    requestBody: {
      type: "multipart/form-data",
      description: "Files and analysis options",
      example: {
        "files[0]": "File object",
        "files[1]": "File object",
        options: JSON.stringify({
          domain: "finance",
          targetFormat: "parquet",
          analysisDepth: "comprehensive",
        }),
      },
    },
    responses: [
      {
        status: 200,
        description: "Metadata generated successfully",
        example: {
          id: "proj_123456789",
          name: "Financial Data Analysis",
          description: "Comprehensive analysis of financial transaction data with quality assessment",
          domain: "finance",
          owner: "data-team@company.com",
          status: "draft",
          createdAt: "2024-01-15T10:30:00Z",
          sourceFormat: "csv",
          targetFormat: "parquet",
          estimatedDuration: 1800,
          metadata: {
            totalRecords: 150000,
            totalColumns: 25,
            dataQualityScore: 0.87,
            suggestedTransformations: ["normalize_currency", "validate_dates"],
          },
        },
      },
    ],
    examples: [
      {
        title: "Basic File Analysis",
        description: "Generate metadata for a simple CSV file",
        request: {
          files: ["transactions.csv"],
          options: { analysisDepth: "basic" },
        },
        response: {
          id: "proj_basic_001",
          name: "Transaction Data",
          description: "Basic transaction data analysis",
          metadata: { totalRecords: 1000, totalColumns: 5 },
        },
      },
    ],
  },

  {
    id: "get-projects",
    method: "GET",
    path: "/api/projects",
    title: "List Projects",
    description: "Retrieve a paginated list of all projects with optional filtering and sorting",
    category: "Core Operations",
    parameters: [
      {
        name: "$filter",
        type: "string",
        required: false,
        description: "OData filter expression",
        example: "status eq 'active' and domain eq 'finance'",
      },
      {
        name: "$orderby",
        type: "string",
        required: false,
        description: "Sort order specification",
        example: "createdAt desc",
      },
      {
        name: "$top",
        type: "number",
        required: false,
        description: "Maximum number of results to return",
        example: 50,
      },
      {
        name: "$skip",
        type: "number",
        required: false,
        description: "Number of results to skip",
        example: 0,
      },
    ],
    responses: [
      {
        status: 200,
        description: "Projects retrieved successfully",
        example: {
          "@odata.context": "$metadata#Projects",
          "@odata.count": 150,
          value: [
            {
              id: "proj_123456789",
              name: "Financial Data Analysis",
              description: "Comprehensive financial data transformation",
              status: "active",
              createdAt: "2024-01-15T10:30:00Z",
              progress: 75,
            },
          ],
        },
      },
    ],
  },

  {
    id: "initiate-conversion",
    method: "POST",
    path: "/api/processes/conversion",
    title: "Initiate Conversion",
    description: "Start a data conversion process for specified files and target format",
    category: "Core Operations",
    requestBody: {
      type: "application/json",
      description: "Conversion configuration",
      example: {
        projectId: "proj_123456789",
        sourceFiles: ["file_001", "file_002"],
        targetFormat: "parquet",
        options: {
          compression: "snappy",
          partitioning: ["year", "month"],
          validation: true,
        },
      },
    },
    responses: [
      {
        status: 202,
        description: "Conversion process initiated",
        example: {
          id: "proc_conversion_001",
          projectId: "proj_123456789",
          type: "conversion",
          status: "queued",
          progress: 0,
          startedAt: "2024-01-15T11:00:00Z",
          estimatedCompletion: "2024-01-15T11:30:00Z",
        },
      },
    ],
  },

  {
    id: "add-files-queue",
    method: "POST",
    path: "/api/queue/files",
    title: "Add Files to Queue",
    description: "Upload files to the processing queue with optional project association and metadata",
    category: "Core Operations",
    requestBody: {
      type: "multipart/form-data",
      description: "Files and metadata",
      example: {
        "files[0]": "File object",
        "files[1]": "File object",
        projectId: "proj_123456789",
        metadata: JSON.stringify({
          priority: "high",
          tags: ["financial", "quarterly"],
          retention: "7-years",
        }),
      },
    },
    responses: [
      {
        status: 201,
        description: "Files added to queue successfully",
        example: {
          value: [
            {
              id: "file_queue_001",
              filename: "q4_transactions.csv",
              originalName: "Q4_Transactions_2024.csv",
              size: 2048576,
              mimeType: "text/csv",
              status: "uploaded",
              projectId: "proj_123456789",
              uploadedAt: "2024-01-15T11:15:00Z",
            },
          ],
        },
      },
    ],
  },

  {
    id: "get-converted-file",
    method: "GET",
    path: "/api/processes('{processId}')/output",
    title: "Get Converted File",
    description: "Download the output file from a completed conversion process",
    category: "Core Operations",
    parameters: [
      {
        name: "processId",
        type: "string",
        required: true,
        description: "ID of the completed conversion process",
        example: "proc_conversion_001",
      },
      {
        name: "format",
        type: "string",
        required: false,
        description: "Response format: blob, url, or metadata",
        example: "blob",
      },
    ],
    responses: [
      {
        status: 200,
        description: "File download successful",
        example: "Binary file content or download URL",
      },
      {
        status: 404,
        description: "Process not found or output not available",
        example: {
          error: "PROCESS_NOT_FOUND",
          message: "Process not found or output not ready",
        },
      },
    ],
  },

  {
    id: "get-active-processes",
    method: "GET",
    path: "/api/processes",
    title: "List Active Processes",
    description: "Retrieve all active (queued or running) processes with real-time status updates",
    category: "Core Operations",
    parameters: [
      {
        name: "$filter",
        type: "string",
        required: false,
        description: "Filter for active processes (automatically applied: status in ('queued','running'))",
        example: "type eq 'conversion'",
      },
      {
        name: "$orderby",
        type: "string",
        required: false,
        description: "Sort order",
        example: "startedAt desc",
      },
    ],
    responses: [
      {
        status: 200,
        description: "Active processes retrieved",
        example: {
          "@odata.context": "$metadata#Processes",
          value: [
            {
              id: "proc_conversion_001",
              projectId: "proj_123456789",
              type: "conversion",
              status: "running",
              progress: 45,
              startedAt: "2024-01-15T11:00:00Z",
              estimatedCompletion: "2024-01-15T11:30:00Z",
            },
          ],
        },
      },
    ],
  },

  {
    id: "get-queue-files",
    method: "GET",
    path: "/api/queue/files",
    title: "List Queue Files",
    description: "Retrieve all files currently in the processing queue with status information",
    category: "Core Operations",
    parameters: [
      {
        name: "$filter",
        type: "string",
        required: false,
        description: "Filter files by status, project, or other criteria",
        example: "status in ('uploaded','queued') and projectId eq 'proj_123'",
      },
    ],
    responses: [
      {
        status: 200,
        description: "Queue files retrieved",
        example: {
          "@odata.context": "$metadata#QueueFiles",
          value: [
            {
              id: "file_queue_001",
              filename: "processed_q4_transactions.csv",
              status: "queued",
              size: 2048576,
              uploadedAt: "2024-01-15T11:15:00Z",
              projectId: "proj_123456789",
            },
          ],
        },
      },
    ],
  },

  // Data Quality Services
  {
    id: "validate-data",
    method: "POST",
    path: "/api/validation/validate",
    title: "Validate Data",
    description: "Perform comprehensive data validation including schema, quality, and business rule checks",
    category: "Data Quality",
    requestBody: {
      type: "application/json",
      description: "Validation configuration",
      example: {
        fileId: "file_queue_001",
        validationType: "comprehensive",
        rules: {
          schema: {
            enforceTypes: true,
            allowNulls: false,
          },
          quality: {
            duplicateThreshold: 0.05,
            completenessThreshold: 0.95,
          },
          business: {
            customRules: [
              {
                field: "amount",
                rule: "amount > 0",
                message: "Amount must be positive",
              },
            ],
          },
        },
      },
    },
    responses: [
      {
        status: 200,
        description: "Validation completed",
        example: {
          isValid: false,
          qualityScore: 0.87,
          errors: [
            {
              field: "email",
              message: "Invalid email format detected",
              severity: "error",
              affectedRecords: 15,
            },
          ],
          warnings: [
            {
              field: "phone",
              message: "Inconsistent phone number formats",
              severity: "warning",
              affectedRecords: 23,
            },
          ],
        },
      },
    ],
  },

  {
    id: "assess-quality",
    method: "GET",
    path: "/api/quality/assess('{fileId}')",
    title: "Assess Data Quality",
    description: "Comprehensive data quality assessment across multiple dimensions with scoring and recommendations",
    category: "Data Quality",
    parameters: [
      {
        name: "fileId",
        type: "string",
        required: true,
        description: "ID of the file to assess",
        example: "file_queue_001",
      },
      {
        name: "includeProfiler",
        type: "boolean",
        required: false,
        description: "Include detailed statistical profiling",
        example: true,
      },
    ],
    responses: [
      {
        status: 200,
        description: "Quality assessment completed",
        example: {
          overallScore: 0.87,
          dimensions: {
            completeness: 0.95,
            accuracy: 0.82,
            consistency: 0.89,
            validity: 0.91,
            uniqueness: 0.78,
            timeliness: 0.85,
          },
          issues: [
            {
              dimension: "accuracy",
              field: "email",
              issue: "Invalid email formats detected",
              severity: "high",
              affectedRecords: 150,
            },
          ],
          recommendations: ["Implement email validation at data entry", "Consider data cleansing for phone numbers"],
        },
      },
    ],
  },

  // Advanced Services
  {
    id: "discover-schema",
    method: "GET",
    path: "/api/schema/discover('{fileId}')",
    title: "Discover Schema",
    description: "Automatically discover and infer schema structure, data types, and relationships",
    category: "Advanced Services",
    parameters: [
      {
        name: "fileId",
        type: "string",
        required: true,
        description: "ID of the file to analyze",
        example: "file_queue_001",
      },
      {
        name: "inferTypes",
        type: "boolean",
        required: false,
        description: "Automatically infer optimal data types",
        example: true,
      },
    ],
    responses: [
      {
        status: 200,
        description: "Schema discovery completed",
        example: {
          schema: {
            fields: [
              {
                name: "customer_id",
                type: "integer",
                nullable: false,
                constraints: { unique: true },
              },
              {
                name: "email",
                type: "string",
                nullable: false,
                constraints: { format: "email" },
              },
            ],
            relationships: [
              {
                sourceField: "customer_id",
                targetTable: "customers",
                targetField: "id",
                type: "one-to-many",
              },
            ],
          },
          confidence: 0.92,
          suggestions: ["Consider adding index on customer_id", "Validate email format consistency"],
        },
      },
    ],
  },

  {
    id: "get-lineage",
    method: "GET",
    path: "/api/lineage('{entityId}')",
    title: "Get Data Lineage",
    description: "Trace data lineage showing upstream and downstream dependencies and transformations",
    category: "Advanced Services",
    parameters: [
      {
        name: "entityId",
        type: "string",
        required: true,
        description: "ID of the data entity",
        example: "dataset_001",
      },
      {
        name: "direction",
        type: "string",
        required: false,
        description: "Lineage direction: upstream, downstream, or both",
        example: "both",
      },
    ],
    responses: [
      {
        status: 200,
        description: "Lineage information retrieved",
        example: {
          nodes: [
            {
              id: "source_001",
              name: "Raw Transaction Data",
              type: "file",
              metadata: { format: "csv", size: "2.5GB" },
            },
          ],
          edges: [
            {
              source: "source_001",
              target: "processed_001",
              type: "transformation",
              metadata: { operation: "data_cleansing" },
            },
          ],
        },
      },
    ],
  },

  // Monitoring
  {
    id: "system-health",
    method: "GET",
    path: "/api/monitoring/health",
    title: "System Health",
    description: "Get real-time system health status and performance metrics",
    category: "Monitoring",
    responses: [
      {
        status: 200,
        description: "System health retrieved",
        example: {
          status: "healthy",
          services: [
            {
              name: "api-gateway",
              status: "up",
              responseTime: 45,
              lastCheck: "2024-01-15T12:00:00Z",
            },
          ],
          metrics: {
            activeProcesses: 12,
            queuedFiles: 8,
            errorRate: 0.02,
            throughput: 150.5,
          },
        },
      },
    ],
  },
]

const categories = [
  { id: "all", name: "All Endpoints", icon: Book },
  { id: "Authentication", name: "Authentication", icon: Shield },
  { id: "Core Operations", name: "Core Operations", icon: Database },
  { id: "Data Quality", name: "Data Quality", icon: CheckCircle },
  { id: "Advanced Services", name: "Advanced Services", icon: Zap },
  { id: "Monitoring", name: "Monitoring", icon: Activity },
]

const errorCodes = [
  {
    code: "AUTH_001",
    status: 401,
    message: "Invalid or expired access token",
    resolution: "Refresh your access token using the /auth/token endpoint",
  },
  {
    code: "RATE_001",
    status: 429,
    message: "Rate limit exceeded",
    resolution: "Reduce request frequency or upgrade your plan",
  },
  {
    code: "FILE_001",
    status: 400,
    message: "Unsupported file format",
    resolution: "Check supported formats in the documentation",
  },
  {
    code: "PROC_001",
    status: 404,
    message: "Process not found",
    resolution: "Verify the process ID and ensure it exists",
  },
]

export default function ApiDocsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set())

  const filteredEndpoints = apiEndpoints.filter((endpoint) => {
    const matchesSearch =
      endpoint.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.path.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesCategory = selectedCategory === "all" || endpoint.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const toggleEndpoint = (endpointId: string) => {
    const newExpanded = new Set(expandedEndpoints)
    if (newExpanded.has(endpointId)) {
      newExpanded.delete(endpointId)
    } else {
      newExpanded.add(endpointId)
    }
    setExpandedEndpoints(newExpanded)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-green-100 text-green-800",
      POST: "bg-blue-100 text-blue-800",
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800",
    }
    return <Badge className={colors[method as keyof typeof colors]}>{method}</Badge>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">API Documentation</h1>
        <p className="text-lg text-slate-600 mb-6">
          Complete reference for the EPI-USE Data Platform API with examples, authentication, and best practices.
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{apiEndpoints.length}</div>
              <div className="text-sm text-slate-600">Total Endpoints</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">7</div>
              <div className="text-sm text-slate-600">Core Operations</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">OAuth 2.0</div>
              <div className="text-sm text-slate-600">Authentication</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">OData</div>
              <div className="text-sm text-slate-600">Compliant</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="endpoints" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="endpoints">API Reference</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="errors">Error Handling</TabsTrigger>
          <TabsTrigger value="sdk">SDK Usage</TabsTrigger>
        </TabsList>

        {/* API Reference Tab */}
        <TabsContent value="endpoints" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-64 space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search endpoints..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Categories */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Categories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {categories.map((category) => {
                    const Icon = category.icon
                    const count =
                      category.id === "all"
                        ? apiEndpoints.length
                        : apiEndpoints.filter((e) => e.category === category.name).length

                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          selectedCategory === category.id
                            ? "bg-blue-100 text-blue-900"
                            : "hover:bg-slate-100 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span className="text-sm">{category.name}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {count}
                        </Badge>
                      </button>
                    )
                  })}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
              {filteredEndpoints.map((endpoint) => (
                <Card key={endpoint.id} className="overflow-hidden">
                  <Collapsible
                    open={expandedEndpoints.has(endpoint.id)}
                    onOpenChange={() => toggleEndpoint(endpoint.id)}
                  >
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getMethodBadge(endpoint.method)}
                            <div>
                              <CardTitle className="text-lg">{endpoint.title}</CardTitle>
                              <code className="text-sm text-slate-600 font-mono">{endpoint.path}</code>
                            </div>
                          </div>
                          {expandedEndpoints.has(endpoint.id) ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                        <CardDescription>{endpoint.description}</CardDescription>
                      </CardHeader>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <CardContent className="pt-0 space-y-6">
                        {/* Parameters */}
                        {endpoint.parameters && endpoint.parameters.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              Parameters
                            </h4>
                            <div className="space-y-3">
                              {endpoint.parameters.map((param) => (
                                <div key={param.name} className="border rounded-lg p-3">
                                  <div className="flex items-center gap-2 mb-2">
                                    <code className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                                      {param.name}
                                    </code>
                                    <Badge variant={param.required ? "default" : "outline"}>{param.type}</Badge>
                                    {param.required && <Badge variant="destructive">Required</Badge>}
                                  </div>
                                  <p className="text-sm text-slate-600 mb-2">{param.description}</p>
                                  {param.example && (
                                    <div className="bg-slate-50 p-2 rounded text-sm font-mono">
                                      Example: {JSON.stringify(param.example)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Request Body */}
                        {endpoint.requestBody && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Code className="h-4 w-4" />
                              Request Body
                            </h4>
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge>{endpoint.requestBody.type}</Badge>
                              </div>
                              <p className="text-sm text-slate-600 mb-3">{endpoint.requestBody.description}</p>
                              <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs text-slate-400">JSON</span>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() =>
                                      copyToClipboard(JSON.stringify(endpoint.requestBody!.example, null, 2))
                                    }
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                <pre className="text-sm">
                                  <code>{JSON.stringify(endpoint.requestBody.example, null, 2)}</code>
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Responses */}
                        <div>
                          <h4 className="font-semibold mb-3 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            Responses
                          </h4>
                          <div className="space-y-3">
                            {endpoint.responses.map((response, index) => (
                              <div key={index} className="border rounded-lg p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    className={
                                      response.status < 300
                                        ? "bg-green-100 text-green-800"
                                        : response.status < 400
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                    }
                                  >
                                    {response.status}
                                  </Badge>
                                  <span className="text-sm font-medium">{response.description}</span>
                                </div>
                                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400">Response</span>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => copyToClipboard(JSON.stringify(response.example, null, 2))}
                                    >
                                      <Copy className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  <pre className="text-sm">
                                    <code>{JSON.stringify(response.example, null, 2)}</code>
                                  </pre>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Examples */}
                        {endpoint.examples && endpoint.examples.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center gap-2">
                              <Zap className="h-4 w-4" />
                              Usage Examples
                            </h4>
                            <div className="space-y-4">
                              {endpoint.examples.map((example, index) => (
                                <div key={index} className="border rounded-lg p-4">
                                  <h5 className="font-medium mb-2">{example.title}</h5>
                                  <p className="text-sm text-slate-600 mb-3">{example.description}</p>
                                  <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                      <div className="text-sm font-medium mb-2">Request</div>
                                      <div className="bg-slate-900 text-slate-100 p-3 rounded text-sm overflow-x-auto">
                                        <pre>
                                          <code>{JSON.stringify(example.request, null, 2)}</code>
                                        </pre>
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-sm font-medium mb-2">Response</div>
                                      <div className="bg-slate-900 text-slate-100 p-3 rounded text-sm overflow-x-auto">
                                        <pre>
                                          <code>{JSON.stringify(example.response, null, 2)}</code>
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Collapsible>
                </Card>
              ))}

              {filteredEndpoints.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Search className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No endpoints found</h3>
                    <p className="text-slate-600">Try adjusting your search terms or category filter.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Authentication Tab */}
        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                OAuth 2.0 Authentication
              </CardTitle>
              <CardDescription>
                The API uses OAuth 2.0 Client Credentials flow for authentication. All requests must include a valid
                Bearer token.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Step 1: Obtain Access Token</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{`POST /auth/token
Content-Type: application/json

{
  "client_id": "your-client-id",
  "client_secret": "your-client-secret",
  "tenant_id": "your-tenant-id",
  "scope": "api://data-platform/.default",
  "grant_type": "client_credentials"
}`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Step 2: Use Token in Requests</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{`GET /api/projects
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIs...
Content-Type: application/json`}</code>
                  </pre>
                </div>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Token Expiry:</strong> Access tokens expire after 1 hour. Implement automatic token refresh in
                  your applications to maintain uninterrupted access.
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-semibold mb-3">Environment Configuration</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Development</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs">https://dev-api.epi-use.com</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Staging</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs">https://staging-api.epi-use.com</code>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Production</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <code className="text-xs">https://api.epi-use.com</code>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Error Handling Tab */}
        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Error Handling
              </CardTitle>
              <CardDescription>
                Understanding API error responses and how to handle them in your applications.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Standard Error Response Format</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{`{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": "Additional error details",
    "timestamp": "2024-01-15T12:00:00Z",
    "traceId": "trace-12345"
  }
}`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Common Error Codes</h4>
                <div className="space-y-3">
                  {errorCodes.map((error) => (
                    <div key={error.code} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          className={
                            error.status < 400
                              ? "bg-yellow-100 text-yellow-800"
                              : error.status < 500
                                ? "bg-red-100 text-red-800"
                                : "bg-purple-100 text-purple-800"
                          }
                        >
                          {error.status}
                        </Badge>
                        <code className="text-sm font-mono">{error.code}</code>
                      </div>
                      <p className="text-sm text-slate-900 mb-2">{error.message}</p>
                      <p className="text-sm text-slate-600">
                        <strong>Resolution:</strong> {error.resolution}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Rate Limiting</h4>
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Rate Limits:</strong> 1000 requests per hour for standard plans, 5000 for premium plans.
                    Rate limit headers are included in all responses.
                  </AlertDescription>
                </Alert>
                <div className="mt-3 bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{`X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1642248000`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SDK Usage Tab */}
        <TabsContent value="sdk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                TypeScript SDK Usage
              </CardTitle>
              <CardDescription>
                Examples of using the TypeScript SDK for common operations and best practices.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Installation & Setup</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{`// Initialize the service
import { createODataService } from '@/lib/odata-service'

const apiService = createODataService({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL!,
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
  clientSecret: process.env.CLIENT_SECRET!,
  tenantId: process.env.TENANT_ID!,
})

// Authenticate
await apiService.authenticate()`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Basic Operations</h4>
                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium mb-2">List Projects with Filtering</h5>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{`// Get active projects in finance domain
const projects = await apiService.getProjects({
  $filter: "status eq 'active' and domain eq 'finance'",
  $orderby: "createdAt desc",
  $top: 10
})

console.log(\`Found \${projects.value.length} projects\`)`}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Upload and Process Files</h5>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{`// Upload files to queue
const files = [file1, file2] // File objects
const queuedFiles = await apiService.addFilesToQueue(files, projectId, {
  priority: 'high',
  tags: ['financial', 'quarterly']
})

// Start conversion process
const process = await apiService.initiateConversion({
  projectId: 'proj_123',
  sourceFiles: queuedFiles.map(f => f.id),
  targetFormat: 'parquet',
  options: { compression: 'snappy' }
})`}</code>
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium mb-2">Data Quality Assessment</h5>
                    <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{`// Assess data quality
const qualityReport = await apiService.assessDataQuality(fileId, {
  includeProfiler: true,
  includeStatistics: true,
  customRules: [
    {
      name: 'positive_amounts',
      expression: 'amount > 0',
      severity: 'error'
    }
  ]
})

console.log(\`Overall quality score: \${qualityReport.overallScore}\`)
qualityReport.issues.forEach(issue => {
  console.log(\`Issue: \${issue.issue} (Severity: \${issue.severity})\`)
})`}</code>
                      </pre>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">React Hooks Usage</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{`// Using custom hooks in React components
import { useProjects, useProcesses } from '@/hooks/use-odata-service'

function ProjectDashboard() {
  const { 
    projects, 
    loading, 
    error, 
    refetch 
  } = useProjects({
    autoRefresh: true,
    refreshInterval: 30000,
    filter: "status eq 'active'"
  })

  const { 
    processes, 
    cancelProcess, 
    retryProcess 
  } = useProcesses({
    autoRefresh: true,
    refreshInterval: 10000
  })

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>Active Projects ({projects.length})</h2>
      {projects.map(project => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  )
}`}</code>
                  </pre>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Error Handling Best Practices</h4>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                  <pre className="text-sm">
                    <code>{`import { ApiError } from '@/lib/odata-service'

try {
  const result = await apiService.generateProjectMetadata(files)
  console.log('Metadata generated:', result)
} catch (error) {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'AUTH_001':
        // Handle authentication error
        await apiService.authenticate()
        // Retry the operation
        break
      case 'RATE_001':
        // Handle rate limiting
        await new Promise(resolve => setTimeout(resolve, 60000))
        break
      case 'FILE_001':
        // Handle unsupported file format
        console.error('Unsupported file format:', error.message)
        break
      default:
        console.error('API Error:', error.message)
    }
  } else {
    console.error('Unexpected error:', error)
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
