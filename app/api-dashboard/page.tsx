"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Activity,
  Database,
  FileText,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react"
import { ApiStatusMonitor } from "@/components/api-status-monitor"
import { useProjects, useProcesses, useQueueFiles, useDataQuality } from "@/hooks/use-odata-service"

export default function ApiDashboardPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Use custom hooks for API data
  const {
    projects,
    loading: projectsLoading,
    error: projectsError,
    refetch: refetchProjects,
  } = useProjects({
    autoRefresh: true,
    refreshInterval: 30000,
  })

  const {
    processes,
    loading: processesLoading,
    error: processesError,
    refetch: refetchProcesses,
    cancelProcess,
    retryProcess,
  } = useProcesses({
    autoRefresh: true,
    refreshInterval: 10000,
  })

  const {
    queueFiles: files,
    loading: filesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useQueueFiles({
    autoRefresh: true,
    refreshInterval: 15000,
  })

  const { data: qualityData, loading: qualityLoading, error: qualityError, refetch: refetchQuality } = useDataQuality()

  // Add these mock functions for the missing methods
  const assessQuality = async (fileId: string) => {
    console.log("Assessing quality for file:", fileId)
  }

  const validateData = async (fileId: string, type: string) => {
    console.log("Validating data for file:", fileId, "type:", type)
  }

  const profileData = async (fileId: string) => {
    console.log("Profiling data for file:", fileId)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
      case "running":
      case "completed":
        return <Badge className="bg-green-100 text-green-800">{status}</Badge>
      case "processing":
      case "queued":
        return <Badge className="bg-blue-100 text-blue-800">{status}</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">{status}</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredProcesses = processes.filter((process) => {
    const matchesSearch =
      process.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      process.projectId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || process.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || file.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">API Dashboard</h1>
        <p className="text-slate-600">Monitor and manage OData API operations and system health</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="processes">Processes</TabsTrigger>
          <TabsTrigger value="queue">File Queue</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects.length}</div>
                <p className="text-xs text-muted-foreground">
                  {projects.filter((p) => p.status === "active").length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Processes</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {processes.filter((p) => ["queued", "running"].includes(p.status)).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {processes.filter((p) => p.status === "running").length} running
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Queued Files</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {files.filter((f) => ["uploaded", "queued"].includes(f.status)).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {files.filter((f) => f.status === "processing").length} processing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {processes.length > 0
                    ? Math.round((processes.filter((p) => p.status === "completed").length / processes.length) * 100)
                    : 0}
                  %
                </div>
                <p className="text-xs text-muted-foreground">
                  {processes.filter((p) => p.status === "failed").length} failed
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest processes and file operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processes.slice(0, 5).map((process) => (
                  <div key={process.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Activity className="h-4 w-4 text-slate-600" />
                      <div>
                        <div className="font-medium">{process.type} Process</div>
                        <div className="text-sm text-slate-600">Project: {process.projectId}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-right text-sm">
                        <div>{new Date(process.startedAt).toLocaleTimeString()}</div>
                        <div className="text-slate-600">{process.progress}% complete</div>
                      </div>
                      {getStatusBadge(process.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Projects</CardTitle>
                  <CardDescription>Manage data transformation projects</CardDescription>
                </div>
                <Button onClick={refetchProjects} disabled={projectsLoading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${projectsLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filter */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search projects..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {projectsError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    Error loading projects: {projectsError.message}
                  </AlertDescription>
                </Alert>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{project.name}</div>
                          <div className="text-sm text-slate-500">{project.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>{project.owner}</TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>
                        {project.progress !== undefined && (
                          <div className="w-16">
                            <div className="text-xs mb-1">{project.progress}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                              <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${project.progress}%` }} />
                            </div>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{new Date(project.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="sm" variant="outline">
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Processes Tab */}
        <TabsContent value="processes" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Processes</CardTitle>
                  <CardDescription>Monitor running and queued processes</CardDescription>
                </div>
                <Button onClick={refetchProcesses} disabled={processesLoading}>
                  <RefreshCw className={`mr-2 h-4 w-4 ${processesLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {processesError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    Error loading processes: {processesError.message}
                  </AlertDescription>
                </Alert>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Process ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProcesses.map((process) => (
                    <TableRow key={process.id}>
                      <TableCell className="font-mono text-sm">{process.id.slice(0, 8)}...</TableCell>
                      <TableCell>{process.type}</TableCell>
                      <TableCell className="font-mono text-sm">{process.projectId.slice(0, 8)}...</TableCell>
                      <TableCell>{getStatusBadge(process.status)}</TableCell>
                      <TableCell>
                        <div className="w-16">
                          <div className="text-xs mb-1">{process.progress}%</div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${process.progress}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(process.startedAt).toLocaleTimeString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {process.status === "running" && (
                            <Button size="sm" variant="outline" onClick={() => cancelProcess(process.id)}>
                              <Pause className="h-4 w-4" />
                            </Button>
                          )}
                          {process.status === "failed" && (
                            <Button size="sm" variant="outline" onClick={() => retryProcess(process.id)}>
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                          )}
                          {process.status === "completed" && (
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* File Queue Tab */}
        <TabsContent value="queue" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>File Queue</CardTitle>
                  <CardDescription>Monitor files in processing queue</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={refetchFiles} disabled={filesLoading}>
                    <RefreshCw className={`mr-2 h-4 w-4 ${filesLoading ? "animate-spin" : ""}`} />
                    Refresh
                  </Button>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filesError && (
                <Alert className="mb-4 border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">
                    Error loading files: {filesError.message}
                  </AlertDescription>
                </Alert>
              )}

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{file.originalName}</div>
                          <div className="text-sm text-slate-500">{file.mimeType}</div>
                        </div>
                      </TableCell>
                      <TableCell>{(file.size / 1024 / 1024).toFixed(2)} MB</TableCell>
                      <TableCell>{getStatusBadge(file.status)}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {file.projectId ? file.projectId.slice(0, 8) + "..." : "-"}
                      </TableCell>
                      <TableCell>{new Date(file.uploadedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => profileData(file.id)}
                            disabled={qualityLoading}
                          >
                            <Activity className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => validateData(file.id, "quality")}
                            disabled={qualityLoading}
                          >
                            <Filter className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Monitoring Tab */}
        <TabsContent value="monitoring" className="space-y-6">
          <ApiStatusMonitor />
        </TabsContent>
      </Tabs>
    </div>
  )
}
