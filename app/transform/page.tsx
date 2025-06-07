"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileIcon as FileTransfer,
  Upload,
  Database,
  Download,
  CheckCircle,
  AlertTriangle,
  FileText,
} from "lucide-react"

type Project = {
  id: string
  name: string
  description: string
  mappingCount: number
  lastModified: string
  confidence: number
}

type TransformationResult = {
  totalRecords: number
  successfulRecords: number
  failedRecords: number
  warnings: string[]
  processingTime: number
}

export default function TransformPage() {
  const [selectedProject, setSelectedProject] = useState<string>("")
  const [inputMethod, setInputMethod] = useState<"upload" | "ldq">("upload")
  const [isTransforming, setIsTransforming] = useState(false)
  const [transformProgress, setTransformProgress] = useState(0)
  const [transformResult, setTransformResult] = useState<TransformationResult | null>(null)

  const projects: Project[] = [
    {
      id: "1",
      name: "Customer Data Migration",
      description: "Maps customer data from legacy CRM",
      mappingCount: 15,
      lastModified: "2024-01-15",
      confidence: 92,
    },
    {
      id: "2",
      name: "Product Catalog Sync",
      description: "Synchronizes product information",
      mappingCount: 23,
      lastModified: "2024-01-12",
      confidence: 88,
    },
    {
      id: "3",
      name: "Financial Data Export",
      description: "Exports financial records for reporting",
      mappingCount: 31,
      lastModified: "2024-01-10",
      confidence: 95,
    },
  ]

  const handleTransformation = () => {
    setIsTransforming(true)
    setTransformProgress(0)
    setTransformResult(null)

    // Simulate transformation process
    const interval = setInterval(() => {
      setTransformProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsTransforming(false)
          // Generate sample result
          setTransformResult({
            totalRecords: 1250,
            successfulRecords: 1248,
            failedRecords: 2,
            warnings: ["Row 45: Email format validation warning", "Row 127: Phone number format adjusted"],
            processingTime: 2.3,
          })
          return 100
        }
        return prev + 8
      })
    }, 200)
  }

  const selectedProjectData = projects.find((p) => p.id === selectedProject)

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
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
              <CardDescription>Choose a saved mapping configuration for transformation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project..." />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{project.name}</span>
                        <Badge variant="outline" className="ml-2">
                          {project.confidence}% confidence
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedProjectData && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">{selectedProjectData.name}</h3>
                  <p className="text-sm text-blue-700 mb-3">{selectedProjectData.description}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Mapping Rules:</span>
                      <span className="ml-2 font-medium">{selectedProjectData.mappingCount}</span>
                    </div>
                    <div>
                      <span className="text-blue-600">Last Modified:</span>
                      <span className="ml-2 font-medium">{selectedProjectData.lastModified}</span>
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
              <CardDescription>Choose how to provide your source data</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as "upload" | "ldq")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Manual Upload</TabsTrigger>
                  <TabsTrigger value="ldq">Data Queue</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                    <Upload className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Upload Source File</h3>
                    <p className="text-slate-600 mb-4">Click to upload or drag and drop your data file</p>
                    <p className="text-sm text-slate-500">Supports CSV, XLSX, JSON, XML (Max 100MB)</p>
                  </div>
                </TabsContent>

                <TabsContent value="ldq" className="mt-4">
                  <div className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="h-8 w-8 text-purple-600" />
                      <div>
                        <h3 className="font-semibold">Select from Data Queue</h3>
                        <p className="text-sm text-slate-600">Choose a file from your data queue</p>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Database className="mr-2 h-4 w-4" />
                      Browse Data Queue
                    </Button>
                  </div>
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
              {!isTransforming && !transformResult ? (
                <Button
                  onClick={handleTransformation}
                  disabled={!selectedProject}
                  className="w-full bg-blue-900 hover:bg-blue-800"
                  size="lg"
                >
                  <FileTransfer className="mr-2 h-5 w-5" />
                  Start Transformation
                </Button>
              ) : isTransforming ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-4"></div>
                    <h3 className="font-semibold mb-2">Transforming Data...</h3>
                    <p className="text-sm text-slate-600">
                      Processing your data using the selected mapping configuration
                    </p>
                  </div>
                  <Progress value={transformProgress} className="w-full" />
                  <p className="text-center text-sm text-slate-500">{transformProgress}% Complete</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Transformation completed successfully! Your data has been processed and is ready for download.
                    </AlertDescription>
                  </Alert>
                  <div className="flex gap-2">
                    <Button className="flex-1">
                      <Download className="mr-2 h-4 w-4" />
                      Download Results
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setTransformResult(null)
                        setTransformProgress(0)
                      }}
                    >
                      Transform Another
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {transformResult && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Processing Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600">Total Records:</span>
                      <div className="font-semibold text-lg">{transformResult.totalRecords.toLocaleString()}</div>
                    </div>
                    <div>
                      <span className="text-slate-600">Success Rate:</span>
                      <div className="font-semibold text-lg text-green-600">
                        {((transformResult.successfulRecords / transformResult.totalRecords) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">Successful:</span>
                      <div className="font-semibold text-green-600">
                        {transformResult.successfulRecords.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-600">Failed:</span>
                      <div className="font-semibold text-red-600">{transformResult.failedRecords}</div>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-slate-600 text-sm">Processing Time:</span>
                    <div className="font-semibold">{transformResult.processingTime}s</div>
                  </div>
                </CardContent>
              </Card>

              {transformResult.warnings.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      Warnings ({transformResult.warnings.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {transformResult.warnings.map((warning, index) => (
                        <div key={index} className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2">
                          {warning}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                View Mapping Rules
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Database className="mr-2 h-4 w-4" />
                Browse Data Queue
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Upload className="mr-2 h-4 w-4" />
                Upload New File
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
