"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Upload,
  FileUp,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Download,
  RefreshCw,
  FileText,
  Database,
  Table,
  Settings,
  Zap,
  BarChart3,
  BookOpen,
} from "lucide-react"

type GeneratedContract = {
  yaml: string
  metadata: {
    fileName: string
    fileType: string
    recordCount?: number
    fieldCount: number
    inferredSchema: any
    quality?: any
    warnings?: string[]
    errors?: string[]
  }
}

interface FileUploadDialogProps {
  onFileUpload: (file: File, library: "frictionless" | "datacontract-cli") => Promise<void>
  uploadStatus: "idle" | "uploading" | "processing" | "completed" | "error"
  uploadProgress: number
  uploadMessage: string
  generatedContract: GeneratedContract | null
  onDownloadYaml: () => void
  onReset: () => void
  onAssignContract: () => void
  onAddBusinessContext: () => void
}

export function FileUploadDialog({
  onFileUpload,
  uploadStatus,
  uploadProgress,
  uploadMessage,
  generatedContract,
  onDownloadYaml,
  onReset,
  onAssignContract,
  onAddBusinessContext,
}: FileUploadDialogProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedLibrary, setSelectedLibrary] = useState<"frictionless" | "datacontract-cli">("frictionless")

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      setSelectedFile(file)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (selectedFile) {
      await onFileUpload(selectedFile, selectedLibrary)
    }
  }

  const getLibraryInfo = () => ({
    frictionless: {
      name: "Frictionless-py",
      description: "Advanced data profiling and validation",
      features: ["Schema inference", "Data quality analysis", "Constraint detection", "Statistical profiling"],
      icon: BarChart3,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    "datacontract-cli": {
      name: "DataContract CLI",
      description: "Simple contract generation",
      features: ["Basic schema detection", "Standard templates", "Quick generation", "Format support"],
      icon: Zap,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  })

  const getSupportedFormats = () => [
    { ext: "CSV", desc: "Comma-separated values", icon: Table, both: true },
    { ext: "JSON", desc: "JavaScript Object Notation", icon: FileText, both: true },
    { ext: "Parquet", desc: "Columnar storage format", icon: Database, frictionless: true },
    { ext: "JSONL", desc: "JSON Lines format", icon: FileText, frictionless: true },
    { ext: "Excel", desc: "Excel spreadsheets", icon: Table, frictionless: true },
    { ext: "SQL", desc: "SQL DDL statements", icon: Database, datacontract: true },
  ]

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case "uploading":
      case "processing":
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      default:
        return null
    }
  }

  if (uploadStatus === "completed" && generatedContract) {
    return (
      <div className="space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Data contract generated successfully using{" "}
            {selectedLibrary === "frictionless" ? "frictionless-py" : "datacontract-cli"}!
          </AlertDescription>
        </Alert>

        {/* Metadata Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">File Analysis</Label>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">File:</span>
                <span className="font-medium">{generatedContract.metadata.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Type:</span>
                <span className="font-medium">{generatedContract.metadata.fileType.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Fields:</span>
                <span className="font-medium">{generatedContract.metadata.fieldCount}</span>
              </div>
              {generatedContract.metadata.recordCount && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Records:</span>
                  <span className="font-medium">{generatedContract.metadata.recordCount.toLocaleString()}</span>
                </div>
              )}
            </div>
          </div>

          {generatedContract.metadata.quality && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Quality Metrics</Label>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Completeness:</span>
                  <span className="font-medium">{generatedContract.metadata.quality.fieldStats?.completeness}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Validity:</span>
                  <span className="font-medium">{generatedContract.metadata.quality.fieldStats?.validity}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Errors:</span>
                  <span className="font-medium">{generatedContract.metadata.quality.stats?.errors || 0}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Warnings and Errors */}
        {(generatedContract.metadata.warnings?.length || generatedContract.metadata.errors?.length) && (
          <div className="space-y-2">
            {generatedContract.metadata.errors?.map((error, index) => (
              <Alert key={`error-${index}`} className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            ))}
            {generatedContract.metadata.warnings?.map((warning, index) => (
              <Alert key={`warning-${index}`} className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">{warning}</AlertDescription>
              </Alert>
            ))}
          </div>
        )}

        <div>
          <Label className="text-sm font-medium mb-2 block">Generated Data Contract (YAML)</Label>
          <ScrollArea className="h-64 w-full rounded border p-3 bg-slate-50">
            <pre className="text-xs whitespace-pre-wrap font-mono">{generatedContract.yaml}</pre>
          </ScrollArea>
        </div>

        <div className="flex gap-2">
          <Button onClick={onDownloadYaml} variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download YAML
          </Button>
          <Button onClick={onAddBusinessContext} variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Add Business Context
          </Button>
          <Button onClick={onAssignContract} className="flex-1">
            <Settings className="mr-2 h-4 w-4" />
            Assign to Contract
          </Button>
          <Button variant="outline" onClick={onReset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Upload Another
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Library Selection */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Processing Library</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.entries(getLibraryInfo()).map(([key, info]) => {
            const Icon = info.icon
            const isSelected = selectedLibrary === key
            return (
              <div
                key={key}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected ? `${info.borderColor} ${info.bgColor}` : "border-slate-200 hover:border-slate-300"
                }`}
                onClick={() => setSelectedLibrary(key as "frictionless" | "datacontract-cli")}
              >
                <div className="flex items-start gap-3">
                  <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? info.color : "text-slate-400"}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-sm">{info.name}</h3>
                      {isSelected && (
                        <Badge variant="secondary" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{info.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {info.features.map((feature) => (
                        <Badge key={feature} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Supported Formats */}
      <div>
        <Label className="text-sm font-medium mb-3 block">
          Supported Formats for {getLibraryInfo()[selectedLibrary].name}
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {getSupportedFormats()
            .filter((format) => {
              if (selectedLibrary === "frictionless") {
                return format.both || format.frictionless
              } else {
                return format.both || format.datacontract
              }
            })
            .map(({ ext, desc, icon: Icon }) => (
              <div key={ext} className="flex items-center gap-2 p-2 rounded border bg-slate-50">
                <Icon className="h-4 w-4 text-slate-600" />
                <div>
                  <div className="text-sm font-medium">{ext}</div>
                  <div className="text-xs text-slate-600">{desc}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      <Separator />

      {/* File Upload Area */}
      <div>
        <Label className="text-sm font-medium mb-3 block">Upload Sample File</Label>

        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive ? "border-blue-400 bg-blue-50" : "border-slate-300 hover:border-slate-400"
          } ${uploadStatus !== "idle" ? "opacity-50 pointer-events-none" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileSelect}
            accept=".csv,.json,.parquet,.jsonl,.xlsx,.xls,.sql"
            disabled={uploadStatus !== "idle"}
          />

          <div className="space-y-4">
            <FileUp className="h-12 w-12 text-slate-400 mx-auto" />
            <div>
              <p className="text-lg font-medium text-slate-700">
                {selectedFile ? selectedFile.name : "Drop your file here or click to browse"}
              </p>
              <p className="text-sm text-slate-500 mt-1">Processing with {getLibraryInfo()[selectedLibrary].name}</p>
              {selectedFile && (
                <p className="text-xs text-slate-600 mt-2">Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadStatus !== "idle" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">{uploadMessage}</span>
          </div>

          <Progress value={uploadProgress} className="w-full" />

          {uploadStatus === "processing" && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription>
                Running {getLibraryInfo()[selectedLibrary].name} to analyze your file and generate the contract
                definition...
              </AlertDescription>
            </Alert>
          )}

          {uploadStatus === "error" && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{uploadMessage}</AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          onClick={onReset}
          className="flex-1"
          disabled={uploadStatus === "uploading" || uploadStatus === "processing"}
        >
          Cancel
        </Button>
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadStatus === "uploading" || uploadStatus === "processing"}
          className="flex-1"
        >
          {uploadStatus === "uploading" || uploadStatus === "processing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="mr-2 h-4 w-4" />
              Generate Contract
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
