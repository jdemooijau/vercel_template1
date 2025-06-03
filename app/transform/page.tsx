"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  FileIcon as FileTransfer,
  Upload,
  Database,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
  Play,
} from "lucide-react"

interface Project {
  id: string
  name: string
  description: string
  mappingCount: number
  lastModified: string
  avgConfidence: number
}

interface TransformationResult {
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  warnings: Array<{ row: number; message: string }>
  processingTime: number
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Customer Data Migration",
    description: "Maps customer data from legacy CRM to new system",
    mappingCount: 15,
    lastModified: "2024-01-15",
    avgConfidence: 92,
  },
  {
    id: "2",
    name: "Payroll Integration",
    description: "Employee payroll data transformation for SAP",
    mappingCount: 23,
    lastModified: "2024-01-12",
    avgConfidence: 88,
  },
  {
    id: "3",
    name: "Product Catalog Sync",
    description: "Product information synchronization between systems",
    mappingCount: 18,
    lastModified: "2024-01-10",
    avgConfidence: 95,
  },
]

const mockLDQFiles = [
  { id: "1", filename: "customer_data.csv", size: "2.1 MB", uploadDate: "2024-01-15" },
  { id: "2", filename: "employee_records.xlsx", size: "1.8 MB", uploadDate: "2024-01-14" },
  { id: "3", filename: "product_catalog.json", size: "3.2 MB", uploadDate: "2024-01-13" },
]

export default function TransformPage() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [sourceMethod, setSourceMethod] = useState<"upload" | "ldq">("upload")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedLDQFile, setSelectedLDQFile] = useState<string>("")
  const [isTransforming, setIsTransforming] = useState(false)
  const [transformProgress, setTransformProgress] = useState(0)
  const [transformResult, setTransformResult] = useState<TransformationResult | null>(null)

  const handleProjectSelect = (projectId: string) => {
    const project = mockProjects.find((p) => p.id === projectId)
    setSelectedProject(project || null)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const startTransformation = () => {
    if (!selectedProject || (!selectedFile && !selectedLDQFile)) return

    setIsTransforming(true)
    setTransformProgress(0)
    setTransformResult(null)

    // Simulate transformation process
    const interval = setInterval(() => {
      setTransformProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTransforming(false)
          // Generate mock results
          setTransformResult({
            totalRecords: 1250,
            successfulRecords: 1248,
            failedRecords: 2,
            warnings: [
              { row: 45, message: "Invalid email format, using default" },
              { row: 127, message: "Phone number format corrected" },
            ],
            processingTime: 2.3,
          })
          return 100
        }
        return prev + 5
      })
    }, 200)
  }

  const canStartTransformation = () => {
    return selectedProject && (selectedFile || selectedLDQFile)
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Transformation</h1>
        <p className="text-slate-600">Transform your data using saved mapping configurations</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileTransfer className="h-5 w-5" />
                Select Mapping Project
              </CardTitle>
              <CardDescription>Choose a saved mapping configuration for your transformation</CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleProjectSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {mockProjects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{project.name}</span>
                        <Badge variant="secondary" className="ml-2">
                          {project.mappingCount} mappings
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProject && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">{selectedProject.name}</h4>
                      <p className="text-sm text-blue-700 mt-1">{selectedProject.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-blue-600">
                        <span>• {selectedProject.mappingCount} field mappings configured</span>
                        <span>• Last modified: {selectedProject.lastModified}</span>
                        <span>• Avg. confidence: {selectedProject.avgConfidence}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Source Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Data Source</CardTitle>
              <CardDescription>Choose your source data file for transformation</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={sourceMethod} onValueChange={(value) => setSourceMethod(value as "upload" | "ldq")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Manual Upload
                  </TabsTrigger>
                  <TabsTrigger value="ldq" className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Select from LDQ
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="h-8 w-8 text-green-600 mx-auto" />
                        <div className="text-sm font-medium text-green-900">{selectedFile.name}</div>
                        <div className="text-xs text-green-700">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => document.getElementById("file-upload")?.click()}
                        >
                          Change File
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-slate-400 mx-auto" />
                        <div className="text-sm font-medium text-slate-900">Click to upload or drag and drop</div>
                        <div className="text-xs text-slate-500">CSV, XLSX, JSON, XML • Max 50MB</div>
                        <Button size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                          Select File
                        </Button>
                      </div>
                    )}
                    <input
                      id="file-upload"
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.json,.xml"
                      onChange={handleFileUpload}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="ldq" className="mt-4">
                  <Select value={selectedLDQFile} onValueChange={setSelectedLDQFile}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a file from LDQ..." />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLDQFiles.map((file) => (
                        <SelectItem key={file.id} value={file.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{file.filename}</span>
                            <div className="flex items-center gap-2 ml-2">
                              <Badge variant="outline">{file.size}</Badge>
                              <span className="text-xs text-slate-500">{file.uploadDate}</span>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Transformation Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Execute Transformation</CardTitle>
              <CardDescription>Start the data transformation process</CardDescription>
            </CardHeader>
            <CardContent>
              {!canStartTransformation() && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please select both a mapping project and a source file to continue.
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={startTransformation}
                disabled={!canStartTransformation() || isTransforming}
                className="w-full bg-blue-900 hover:bg-blue-800"
                size="lg"
              >
                {isTransforming ? (
                  <>
                    <FileTransfer className="mr-2 h-5 w-5 animate-spin" />
                    Transforming Data...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-5 w-5" />
                    Start Transformation
                  </>
                )}
              </Button>

              {isTransforming && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{transformProgress}%</span>
                  </div>
                  <Progress value={transformProgress} className="h-2" />
                  <p className="text-xs text-slate-600">
                    {transformProgress < 30
                      ? "Loading and validating data..."
                      : transformProgress < 70
                        ? "Applying field mappings..."
                        : transformProgress < 90
                          ? "Validating transformed data..."
                          : "Generating output file..."}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {transformResult ? (
            <>
              {/* Success Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    Transformation Complete
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {transformResult.totalRecords.toLocaleString()}
                      </div>
                      <div className="text-xs text-green-600">Total Records</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-700">
                        {((transformResult.successfulRecords / transformResult.totalRecords) * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-green-600">Success Rate</div>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Successful:</span>
                      <span className="font-medium text-green-700">
                        {transformResult.successfulRecords.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Failed:</span>
                      <span className="font-medium text-red-600">{transformResult.failedRecords.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Processing Time:</span>
                      <span className="font-medium">{transformResult.processingTime}s</span>
                    </div>
                  </div>

                  <Button className="w-full" variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download Results
                  </Button>
                </CardContent>
              </Card>

              {/* Warnings */}
              {transformResult.warnings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-700">
                      <AlertTriangle className="h-5 w-5" />
                      Warnings ({transformResult.warnings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {transformResult.warnings.map((warning, index) => (
                        <div key={index} className="text-sm p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <span className="font-medium">Row {warning.row}:</span> {warning.message}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Transformation Results</CardTitle>
                <CardDescription>Results will appear here after transformation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-400">
                  <FileTransfer className="h-12 w-12 mx-auto mb-4" />
                  <p>No transformation results yet</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
