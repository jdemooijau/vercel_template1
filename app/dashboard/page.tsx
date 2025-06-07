"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Play,
  RefreshCw,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { conversionTracker, ConversionUtils } from "@/lib/conversion-tracker"
import type {
  ConversionRun,
  ConversionFile,
  ConversionError,
  ConversionLog,
  RunFilter,
  RunSummary,
} from "@/types/conversion-tracking"

export default function DashboardPage() {
  const [runs, setRuns] = useState<ConversionRun[]>([])
  const [summary, setSummary] = useState<RunSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedRun, setSelectedRun] = useState<ConversionRun | null>(null)
  const [runDetails, setRunDetails] = useState<{
    files: ConversionFile[]
    errors: ConversionError[]
    logs: ConversionLog[]
    metrics: any
  } | null>(null)

  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [dateRange, setDateRange] = useState<{ start: string; end: string } | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageSize = 20

  useEffect(() => {
    loadData()
  }, [currentPage, statusFilter, typeFilter, dateRange])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const filter: RunFilter = {}

      if (statusFilter !== "all") {
        filter.status = [statusFilter]
      }
      if (typeFilter !== "all") {
        filter.runType = [typeFilter]
      }
      if (dateRange) {
        filter.dateRange = dateRange
      }

      const [runsResult, summaryResult] = await Promise.all([
        conversionTracker.getRuns(filter, pageSize, (currentPage - 1) * pageSize),
        conversionTracker.getSummary(filter),
      ])

      setRuns(runsResult.runs)
      setTotalPages(Math.ceil(runsResult.total / pageSize))
      setSummary(summaryResult)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const loadRunDetails = async (run: ConversionRun) => {
    try {
      setSelectedRun(run)
      setRunDetails(null)

      const [files, errors, logs, metrics] = await Promise.all([
        conversionTracker.getRunFiles(run.id),
        conversionTracker.getRunErrors(run.id),
        conversionTracker.getRunLogs(run.id),
        conversionTracker.getRunMetrics(run.id),
      ])

      setRunDetails({ files, errors, logs, metrics })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const getStatusBadge = (status: string) => {
    const color = ConversionUtils.getStatusColor(status)
    const icons = {
      completed: <CheckCircle className="h-3 w-3" />,
      running: <Play className="h-3 w-3" />,
      queued: <Clock className="h-3 w-3" />,
      failed: <XCircle className="h-3 w-3" />,
      cancelled: <XCircle className="h-3 w-3" />,
    }

    return (
      <Badge className={`bg-${color}-100 text-${color}-800 flex items-center gap-1`}>
        {icons[status as keyof typeof icons]}
        {status}
      </Badge>
    )
  }

  const getSeverityBadge = (severity: string) => {
    const color = ConversionUtils.getSeverityColor(severity)
    return <Badge className={`bg-${color}-100 text-${color}-800`}>{severity}</Badge>
  }

  const filteredRuns = runs.filter(
    (run) =>
      run.projectId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Conversion Dashboard</h1>
        <p className="text-slate-600">Monitor and analyze all conversion runs, errors, and performance metrics</p>
      </div>

      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalRuns}</div>
              <p className="text-xs text-muted-foreground">
                {summary.successfulRuns} successful, {summary.failedRuns} failed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {summary.totalRuns > 0 ? Math.round((1 - summary.errorRate) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Avg quality: {Math.round(summary.avgSuccessRate)}%</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalFilesProcessed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {ConversionUtils.formatFileSize(summary.totalDataProcessed)} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ConversionUtils.formatDuration(summary.avgDuration)}</div>
              <p className="text-xs text-muted-foreground">Per conversion run</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Conversion Runs</CardTitle>
              <CardDescription>Track and analyze all conversion operations</CardDescription>
            </div>
            <Button onClick={loadData} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search runs by ID or project..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="queued">Queued</SelectItem>
                  <SelectItem value="running">Running</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="batch">Batch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Runs Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Run ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Files</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRuns.map((run) => (
                <TableRow key={run.id}>
                  <TableCell className="font-mono text-sm">{run.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <Badge variant="outline">{run.runType}</Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(run.status)}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>
                        {run.processedFiles}/{run.totalFiles}
                      </div>
                      {run.failedFiles > 0 && <div className="text-red-600">{run.failedFiles} failed</div>}
                    </div>
                  </TableCell>
                  <TableCell>{run.duration ? ConversionUtils.formatDuration(run.duration) : "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="text-sm">{Math.round(run.successRate)}%</div>
                      {run.errorCount > 0 && (
                        <Badge className="bg-red-100 text-red-800 text-xs">{run.errorCount} errors</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{new Date(run.startedAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => loadRunDetails(run)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-6xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle>Run Details: {run.id}</DialogTitle>
                          <DialogDescription>Detailed information about conversion run</DialogDescription>
                        </DialogHeader>

                        {selectedRun && (
                          <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="grid w-full grid-cols-5">
                              <TabsTrigger value="overview">Overview</TabsTrigger>
                              <TabsTrigger value="files">Files</TabsTrigger>
                              <TabsTrigger value="errors">Errors</TabsTrigger>
                              <TabsTrigger value="logs">Logs</TabsTrigger>
                              <TabsTrigger value="metrics">Metrics</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-sm">Run Information</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Status:</span>
                                      {getStatusBadge(selectedRun.status)}
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Type:</span>
                                      <Badge variant="outline">{selectedRun.runType}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Started:</span>
                                      <span className="text-sm">
                                        {new Date(selectedRun.startedAt).toLocaleString()}
                                      </span>
                                    </div>
                                    {selectedRun.completedAt && (
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Completed:</span>
                                        <span className="text-sm">
                                          {new Date(selectedRun.completedAt).toLocaleString()}
                                        </span>
                                      </div>
                                    )}
                                    {selectedRun.duration && (
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Duration:</span>
                                        <span className="text-sm">
                                          {ConversionUtils.formatDuration(selectedRun.duration)}
                                        </span>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-sm">Processing Summary</CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Total Files:</span>
                                      <span className="text-sm font-medium">{selectedRun.totalFiles}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Processed:</span>
                                      <span className="text-sm font-medium">{selectedRun.processedFiles}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Failed:</span>
                                      <span className="text-sm font-medium text-red-600">
                                        {selectedRun.failedFiles}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Success Rate:</span>
                                      <span className="text-sm font-medium">
                                        {Math.round(selectedRun.successRate)}%
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-muted-foreground">Data Size:</span>
                                      <span className="text-sm font-medium">
                                        {ConversionUtils.formatFileSize(selectedRun.totalSizeBytes)}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            </TabsContent>

                            <TabsContent value="files">
                              <ScrollArea className="h-96">
                                {runDetails?.files && (
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>File</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Size</TableHead>
                                        <TableHead>Duration</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {runDetails.files.map((file) => (
                                        <TableRow key={file.id}>
                                          <TableCell>
                                            <div>
                                              <div className="font-medium">{file.originalName}</div>
                                              <div className="text-sm text-muted-foreground">{file.mimeType}</div>
                                            </div>
                                          </TableCell>
                                          <TableCell>
                                            <Badge variant="outline">{file.fileType}</Badge>
                                          </TableCell>
                                          <TableCell>{getStatusBadge(file.status)}</TableCell>
                                          <TableCell>{ConversionUtils.formatFileSize(file.sizeBytes)}</TableCell>
                                          <TableCell>
                                            {file.processingDuration
                                              ? ConversionUtils.formatDuration(file.processingDuration)
                                              : "-"}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                )}
                              </ScrollArea>
                            </TabsContent>

                            <TabsContent value="errors">
                              <ScrollArea className="h-96">
                                {runDetails?.errors && runDetails.errors.length > 0 ? (
                                  <div className="space-y-4">
                                    {runDetails.errors.map((error) => (
                                      <Card key={error.id}>
                                        <CardContent className="pt-4">
                                          <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                              {getSeverityBadge(error.severity)}
                                              <Badge variant="outline">{error.errorType}</Badge>
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                              {new Date(error.createdAt).toLocaleString()}
                                            </span>
                                          </div>
                                          <div className="space-y-2">
                                            <div>
                                              <span className="font-medium">Error:</span> {error.message}
                                            </div>
                                            {error.stackTrace && (
                                              <details className="text-sm">
                                                <summary className="cursor-pointer text-muted-foreground">
                                                  Stack Trace
                                                </summary>
                                                <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
                                                  {error.stackTrace}
                                                </pre>
                                              </details>
                                            )}
                                          </div>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-8 text-muted-foreground">
                                    No errors recorded for this run
                                  </div>
                                )}
                              </ScrollArea>
                            </TabsContent>

                            <TabsContent value="logs">
                              <ScrollArea className="h-96">
                                {runDetails?.logs && (
                                  <div className="space-y-2">
                                    {runDetails.logs.map((log) => (
                                      <div key={log.id} className="flex items-start gap-3 p-2 rounded border">
                                        <Badge
                                          variant="outline"
                                          className={`text-xs ${
                                            log.level === "error"
                                              ? "border-red-200 text-red-800"
                                              : log.level === "warn"
                                                ? "border-yellow-200 text-yellow-800"
                                                : log.level === "info"
                                                  ? "border-blue-200 text-blue-800"
                                                  : "border-gray-200 text-gray-800"
                                          }`}
                                        >
                                          {log.level}
                                        </Badge>
                                        <div className="flex-1">
                                          <div className="text-sm">{log.message}</div>
                                          <div className="text-xs text-muted-foreground">
                                            {new Date(log.timestamp).toLocaleTimeString()} • {log.category}
                                            {log.step && ` • ${log.step}`}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </ScrollArea>
                            </TabsContent>

                            <TabsContent value="metrics">
                              {runDetails?.metrics ? (
                                <div className="grid grid-cols-2 gap-4">
                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Performance</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Total Duration:</span>
                                        <span className="text-sm">
                                          {ConversionUtils.formatDuration(runDetails.metrics.totalDuration)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Avg File Time:</span>
                                        <span className="text-sm">
                                          {ConversionUtils.formatDuration(runDetails.metrics.avgFileProcessingTime)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Files/sec:</span>
                                        <span className="text-sm">{runDetails.metrics.filesPerSecond.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Throughput:</span>
                                        <span className="text-sm">
                                          {ConversionUtils.formatFileSize(runDetails.metrics.bytesPerSecond)}/s
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  <Card>
                                    <CardHeader>
                                      <CardTitle className="text-sm">Resources</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Peak Memory:</span>
                                        <span className="text-sm">
                                          {ConversionUtils.formatFileSize(runDetails.metrics.peakMemoryUsage)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Avg CPU:</span>
                                        <span className="text-sm">{runDetails.metrics.avgCpuUsage.toFixed(1)}%</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Disk Used:</span>
                                        <span className="text-sm">
                                          {ConversionUtils.formatFileSize(runDetails.metrics.diskSpaceUsed)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Network:</span>
                                        <span className="text-sm">
                                          {ConversionUtils.formatFileSize(runDetails.metrics.networkBytesTransferred)}
                                        </span>
                                      </div>
                                    </CardContent>
                                  </Card>
                                </div>
                              ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                  No metrics available for this run
                                </div>
                              )}
                            </TabsContent>
                          </Tabs>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-slate-600">
              Showing {filteredRuns.length} of {runs.length} runs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
