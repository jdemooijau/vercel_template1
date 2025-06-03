"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, FileText, Brain, CheckCircle, Edit, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "upload" | "processing" | "review" | "save"

interface MappingRule {
  id: string
  sourceField: string
  targetField: string
  transformation: string
  confidence: number
  status: "suggested" | "confirmed" | "modified"
}

export default function DataMappingPage() {
  const [currentStep, setCurrentStep] = useState<Step>("upload")
  const [projectName, setProjectName] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState({
    source: null as File | null,
    target: null as File | null,
    sample: null as File | null,
  })
  const [processingProgress, setProcessingProgress] = useState(0)
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([])

  const steps = [
    { id: "upload", title: "Upload", description: "Upload documents and sample data" },
    { id: "processing", title: "AI Mapping", description: "Generate intelligent mappings" },
    { id: "review", title: "Review", description: "Review and customize mappings" },
    { id: "save", title: "Save", description: "Save project configuration" },
  ]

  const handleFileUpload = (type: "source" | "target" | "sample", file: File) => {
    setUploadedFiles((prev) => ({ ...prev, [type]: file }))
  }

  const startAIProcessing = () => {
    setCurrentStep("processing")
    setProcessingProgress(0)

    // Simulate AI processing
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          // Generate mock mapping rules
          setMappingRules([
            {
              id: "1",
              sourceField: "customer_id",
              targetField: "CustomerID",
              transformation: "None",
              confidence: 95,
              status: "suggested",
            },
            {
              id: "2",
              sourceField: "first_name",
              targetField: "FirstName",
              transformation: "None",
              confidence: 92,
              status: "suggested",
            },
            {
              id: "3",
              sourceField: "phone_num",
              targetField: "Phone",
              transformation: "Format XXX-XXX-XXXX",
              confidence: 85,
              status: "suggested",
            },
            {
              id: "4",
              sourceField: "email_addr",
              targetField: "Email",
              transformation: "Validate format",
              confidence: 98,
              status: "suggested",
            },
            {
              id: "5",
              sourceField: "birth_date",
              targetField: "DateOfBirth",
              transformation: "Convert to ISO format",
              confidence: 78,
              status: "suggested",
            },
          ])
          setCurrentStep("review")
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const confirmMapping = (id: string) => {
    setMappingRules((prev) => prev.map((rule) => (rule.id === id ? { ...rule, status: "confirmed" } : rule)))
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500"
    if (confidence >= 80) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getConfidenceBadgeVariant = (confidence: number) => {
    if (confidence >= 90) return "default"
    if (confidence >= 80) return "secondary"
    return "destructive"
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case "upload":
        return projectName && uploadedFiles.source && uploadedFiles.target && uploadedFiles.sample
      case "processing":
        return processingProgress === 100
      case "review":
        return mappingRules.length > 0
      case "save":
        return true
      default:
        return false
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI-Powered Data Mapping</h1>
        <p className="text-slate-600">Create intelligent field mappings between source and target systems</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-medium",
                  currentStep === step.id
                    ? "bg-blue-900 text-white border-blue-900"
                    : steps.findIndex((s) => s.id === currentStep) > index
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-slate-400 border-slate-300",
                )}
              >
                {steps.findIndex((s) => s.id === currentStep) > index ? <CheckCircle className="h-5 w-5" /> : index + 1}
              </div>
              <div className="ml-3 hidden sm:block">
                <div
                  className={cn("text-sm font-medium", currentStep === step.id ? "text-blue-900" : "text-slate-500")}
                >
                  {step.title}
                </div>
                <div className="text-xs text-slate-400">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-0.5 mx-4",
                    steps.findIndex((s) => s.id === currentStep) > index ? "bg-green-500" : "bg-slate-300",
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      {currentStep === "upload" && (
        <div className="space-y-6">
          {/* Project Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Project Configuration</CardTitle>
              <CardDescription>Set up your mapping project details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="projectName">Project Name *</Label>
                <Input
                  id="projectName"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="projectDescription">Description (Optional)</Label>
                <Textarea
                  id="projectDescription"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Describe your mapping project"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FileUploadCard
              title="Source Document"
              description="Upload source system specification"
              acceptedTypes="PDF, DOC, DOCX, TXT"
              maxSize="10MB"
              file={uploadedFiles.source}
              onFileUpload={(file) => handleFileUpload("source", file)}
            />
            <FileUploadCard
              title="Target Document"
              description="Upload target system specification"
              acceptedTypes="PDF, DOC, DOCX, TXT"
              maxSize="10MB"
              file={uploadedFiles.target}
              onFileUpload={(file) => handleFileUpload("target", file)}
            />
            <FileUploadCard
              title="Sample File"
              description="Upload sample source data"
              acceptedTypes="CSV, XLSX, JSON, XML"
              maxSize="50MB"
              file={uploadedFiles.sample}
              onFileUpload={(file) => handleFileUpload("sample", file)}
            />
          </div>

          <div className="flex justify-end">
            <Button
              onClick={startAIProcessing}
              disabled={!canProceedToNext()}
              className="bg-blue-900 hover:bg-blue-800"
            >
              <Brain className="mr-2 h-4 w-4" />
              Generate AI Mappings
            </Button>
          </div>
        </div>
      )}

      {currentStep === "processing" && (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="h-8 w-8 text-blue-900 animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Analyzing Documents with AI</h3>
                <p className="text-slate-600">
                  Our AI is analyzing your documents and generating intelligent field mappings
                </p>
              </div>
              <div className="max-w-md mx-auto">
                <Progress value={processingProgress} className="h-2" />
                <p className="text-sm text-slate-500 mt-2">Progress: {processingProgress}%</p>
              </div>
              <div className="text-sm text-slate-600">
                Current Step:{" "}
                {processingProgress < 30
                  ? "Parsing documents..."
                  : processingProgress < 60
                    ? "Analyzing field structures..."
                    : processingProgress < 90
                      ? "Generating mappings..."
                      : "Calculating confidence scores..."}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "review" && (
        <Card>
          <CardHeader>
            <CardTitle>Review AI-Generated Mappings</CardTitle>
            <CardDescription>Review and customize the field mappings generated by our AI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                {mappingRules.length} mappings found • Average confidence:{" "}
                {Math.round(mappingRules.reduce((acc, rule) => acc + rule.confidence, 0) / mappingRules.length)}%
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm All
                </Button>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Source Field</TableHead>
                  <TableHead>Target Field</TableHead>
                  <TableHead>Transformation</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mappingRules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell>
                      <Checkbox />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{rule.sourceField}</TableCell>
                    <TableCell className="font-mono text-sm">{rule.targetField}</TableCell>
                    <TableCell className="text-sm">{rule.transformation}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", getConfidenceColor(rule.confidence))} />
                        <Badge variant={getConfidenceBadgeVariant(rule.confidence)} className="text-xs">
                          {rule.confidence}%
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={rule.status === "confirmed" ? "default" : "secondary"}>{rule.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => confirmMapping(rule.id)}
                          disabled={rule.status === "confirmed"}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setCurrentStep("save")} className="bg-blue-900 hover:bg-blue-800">
                Save Project Configuration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === "save" && (
        <Card>
          <CardHeader>
            <CardTitle>Project Saved Successfully!</CardTitle>
            <CardDescription>Your mapping configuration has been saved and is ready to use</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900">Configuration Complete</h4>
                    <p className="text-sm text-green-700">
                      Project "{projectName}" has been saved with {mappingRules.length} field mappings
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">{mappingRules.length}</div>
                  <div className="text-sm text-slate-600">Field Mappings</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {Math.round(mappingRules.reduce((acc, rule) => acc + rule.confidence, 0) / mappingRules.length)}%
                  </div>
                  <div className="text-sm text-slate-600">Avg. Confidence</div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900">
                    {mappingRules.filter((rule) => rule.status === "confirmed").length}
                  </div>
                  <div className="text-sm text-slate-600">Confirmed</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={() => (window.location.href = "/transform")}>Use for Transformation</Button>
                <Button variant="outline" onClick={() => (window.location.href = "/projects")}>
                  View All Projects
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setCurrentStep("upload")
                    setProjectName("")
                    setProjectDescription("")
                    setUploadedFiles({ source: null, target: null, sample: null })
                    setMappingRules([])
                    setProcessingProgress(0)
                  }}
                >
                  Create New Project
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface FileUploadCardProps {
  title: string
  description: string
  acceptedTypes: string
  maxSize: string
  file: File | null
  onFileUpload: (file: File) => void
}

function FileUploadCard({ title, description, acceptedTypes, maxSize, file, onFileUpload }: FileUploadCardProps) {
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      onFileUpload(droppedFile)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      onFileUpload(selectedFile)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            file ? "border-green-300 bg-green-50" : "border-slate-300 hover:border-slate-400",
          )}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          {file ? (
            <div className="space-y-2">
              <FileText className="h-8 w-8 text-green-600 mx-auto" />
              <div className="text-sm font-medium text-green-900">{file.name}</div>
              <div className="text-xs text-green-700">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              <Button size="sm" variant="outline" onClick={() => document.getElementById(`file-${title}`)?.click()}>
                Change File
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 text-slate-400 mx-auto" />
              <div className="text-sm font-medium text-slate-900">Click to upload or drag and drop</div>
              <div className="text-xs text-slate-500">
                {acceptedTypes} • Max {maxSize}
              </div>
              <Button size="sm" onClick={() => document.getElementById(`file-${title}`)?.click()}>
                Select File
              </Button>
            </div>
          )}
          <input id={`file-${title}`} type="file" className="hidden" onChange={handleFileSelect} />
        </div>
      </CardContent>
    </Card>
  )
}
