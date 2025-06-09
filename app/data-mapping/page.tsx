"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, Brain, CheckCircle, Edit, AlertTriangle, LinkIcon } from "lucide-react"
import type { MappingRule, DataContract, FileUpload, ValidationResult } from "../../types/data-contract"
import { DataContractEngine } from "../../lib/data-contract-engine"

export default function DataMappingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [projectName, setProjectName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([])
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([])

  // Contract integration
  const [sourceContract, setSourceContract] = useState<string>("none")
  const [targetContract, setTargetContract] = useState<string>("none")
  const [availableContracts, setAvailableContracts] = useState<DataContract[]>([])
  const [contractEngine] = useState(() => new DataContractEngine())

  // File uploads
  const [uploads, setUploads] = useState<{
    sourceDocument?: FileUpload
    targetDocument?: FileUpload
    sourceSampleFile?: FileUpload
    targetSampleFile?: FileUpload
  }>({})

  const steps = [
    { number: 1, title: "Setup", description: "Configure project and select contracts" },
    { number: 2, title: "Upload", description: "Upload documents and sample files" },
    { number: 3, title: "AI Mapping", description: "Generate AI-powered field mappings" },
    { number: 4, title: "Review", description: "Review and validate mappings" },
    { number: 5, title: "Save", description: "Save project configuration" },
  ]

  // Load available contracts on component mount
  useState(() => {
    const contracts = contractEngine.getAllContracts()
    setAvailableContracts(contracts)
  })

  const handleFileUpload = (type: keyof typeof uploads, file: File) => {
    const fileUpload: FileUpload = {
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }

    setUploads((prev) => ({ ...prev, [type]: fileUpload }))
  }

  const handleAIProcessing = async () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate AI processing with contract integration
    const interval = setInterval(async () => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          setCurrentStep(4)
          generateMappingsWithContracts()
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const generateMappingsWithContracts = async () => {
    let generatedRules: MappingRule[] = []

    // Get selected contracts
    const sourceContractData = availableContracts.find((c) => c.id === sourceContract)
    const targetContractData = availableContracts.find((c) => c.id === targetContract)

    if (sourceContractData && targetContractData) {
      // Use contract-based mapping suggestions
      generatedRules = await contractEngine.suggestMappingsFromContracts(sourceContractData, targetContractData)
    } else {
      // Fallback to sample mappings
      generatedRules = [
        {
          id: "1",
          sourceField: "customer.customer_id",
          targetField: "customer.CustomerID",
          transformation: "None",
          confidence: 95,
          status: "suggested",
          sourceContract: sourceContract,
          targetContract: targetContract,
        },
        {
          id: "2",
          sourceField: "customer.first_name",
          targetField: "customer.FirstName",
          transformation: "None",
          confidence: 92,
          status: "suggested",
          sourceContract: sourceContract,
          targetContract: targetContract,
        },
        {
          id: "3",
          sourceField: "customer.phone_num",
          targetField: "customer.Phone",
          transformation: "Format XXX-XXX-XXXX",
          confidence: 85,
          status: "suggested",
          sourceContract: sourceContract,
          targetContract: targetContract,
        },
        {
          id: "4",
          sourceField: "customer.email_addr",
          targetField: "customer.Email",
          transformation: "Validate Email",
          confidence: 98,
          status: "suggested",
          sourceContract: sourceContract,
          targetContract: targetContract,
        },
      ]
    }

    setMappingRules(generatedRules)

    // Validate mappings against contracts
    if (sourceContractData && targetContractData) {
      await validateMappings(generatedRules, sourceContractData, targetContractData)
    }
  }

  const validateMappings = async (
    rules: MappingRule[],
    sourceContractData: DataContract,
    targetContractData: DataContract,
  ) => {
    const allValidationResults: ValidationResult[] = []

    for (const rule of rules) {
      const results = await contractEngine.validateMappingAgainstContract(rule, sourceContractData, targetContractData)
      allValidationResults.push(...results)

      // Update rule validation status
      const hasErrors = results.some((r) => !r.isValid && r.severity === "error")
      const hasWarnings = results.some((r) => !r.isValid && r.severity === "warning")

      rule.validationStatus = hasErrors ? "invalid" : hasWarnings ? "warning" : "valid"
      rule.validationMessage = results.find((r) => !r.isValid)?.message
    }

    setValidationResults(allValidationResults)
    setMappingRules([...rules])
  }

  const confirmMapping = (id: string) => {
    setMappingRules((rules) => rules.map((rule) => (rule.id === id ? { ...rule, status: "confirmed" as const } : rule)))
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-500"
    if (confidence >= 75) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "modified":
        return <Badge className="bg-blue-100 text-blue-800">Modified</Badge>
      default:
        return <Badge variant="outline">Suggested</Badge>
    }
  }

  const getValidationBadge = (validationStatus?: string) => {
    switch (validationStatus) {
      case "valid":
        return <Badge className="bg-green-100 text-green-800">✓ Valid</Badge>
      case "warning":
        return <Badge className="bg-yellow-100 text-yellow-800">⚠ Warning</Badge>
      case "invalid":
        return <Badge className="bg-red-100 text-red-800">✗ Invalid</Badge>
      default:
        return null
    }
  }

  const FileUploadCard = ({
    title,
    description,
    type,
    acceptedTypes,
  }: {
    title: string
    description: string
    type: keyof typeof uploads
    acceptedTypes: string
  }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
          {uploads[type] ? (
            <div className="space-y-2">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
              <p className="text-sm font-medium text-green-700">{uploads[type]!.filename}</p>
              <p className="text-xs text-slate-500">{(uploads[type]!.size / 1024 / 1024).toFixed(2)} MB</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setUploads((prev) => ({ ...prev, [type]: undefined }))}
              >
                Remove
              </Button>
            </div>
          ) : (
            <>
              <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
              <p className="text-xs text-slate-500">{acceptedTypes}</p>
              <input
                type="file"
                className="hidden"
                id={`upload-${type}`}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFileUpload(type, file)
                }}
              />
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => document.getElementById(`upload-${type}`)?.click()}
              >
                Select File
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI-Powered Data Mapping</h1>
        <p className="text-slate-600">Create intelligent field mappings with contract validation</p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep >= step.number
                    ? "bg-blue-900 border-blue-900 text-white"
                    : "border-slate-300 text-slate-400"
                }`}
              >
                {currentStep > step.number ? <CheckCircle className="w-5 h-5" /> : step.number}
              </div>
              <div className="ml-3">
                <div
                  className={`text-sm font-medium ${currentStep >= step.number ? "text-blue-900" : "text-slate-400"}`}
                >
                  {step.title}
                </div>
                <div className="text-xs text-slate-500">{step.description}</div>
              </div>
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-4 ${currentStep > step.number ? "bg-blue-900" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <Tabs value={`step-${currentStep}`} className="w-full">
        {/* Step 1: Setup */}
        <TabsContent value="step-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Configuration</CardTitle>
                <CardDescription>Enter project details and select data contracts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="source-contract">Source Data Contract (Optional)</Label>
                    <Select value={sourceContract} onValueChange={setSourceContract}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source contract..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No contract</SelectItem>
                        {availableContracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.info.title} (v{contract.info.version})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="target-contract">Target Data Contract (Optional)</Label>
                    <Select value={targetContract} onValueChange={setTargetContract}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target contract..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No contract</SelectItem>
                        {availableContracts.map((contract) => (
                          <SelectItem key={contract.id} value={contract.id}>
                            {contract.info.title} (v{contract.info.version})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {(sourceContract !== "none" || targetContract !== "none") && (
                  <Alert>
                    <LinkIcon className="h-4 w-4" />
                    <AlertDescription>
                      Selected contracts will be used to validate mappings and suggest field transformations
                      automatically.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!projectName}
                className="bg-blue-900 hover:bg-blue-800"
              >
                Continue to Upload
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Step 2: Upload */}
        <TabsContent value="step-2">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUploadCard
                title="Source Document"
                description="Upload source layout specification"
                type="sourceDocument"
                acceptedTypes="PDF, DOC, DOCX, TXT (Max 10MB)"
              />

              <FileUploadCard
                title="Target Document"
                description="Upload target format specification"
                type="targetDocument"
                acceptedTypes="PDF, DOC, DOCX, TXT (Max 10MB)"
              />

              <FileUploadCard
                title="Sample File (Source)"
                description="Upload sample source data"
                type="sourceSampleFile"
                acceptedTypes="CSV, XLSX, JSON (Max 50MB)"
              />

              <FileUploadCard
                title="Sample File (Target)"
                description="Upload sample target data format"
                type="targetSampleFile"
                acceptedTypes="CSV, XLSX, JSON (Max 50MB)"
              />
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back to Setup
              </Button>
              <Button
                onClick={() => setCurrentStep(3)}
                disabled={!uploads.sourceDocument && !uploads.sourceSampleFile}
                className="bg-blue-900 hover:bg-blue-800"
              >
                Continue to AI Mapping
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Step 3: AI Processing */}
        <TabsContent value="step-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Mapping Generation
              </CardTitle>
              <CardDescription>
                {sourceContract !== "none" && targetContract !== "none"
                  ? "AI will analyze your documents and contracts to generate validated field mappings"
                  : "AI will analyze your documents to generate field mappings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isProcessing && processingProgress === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 text-blue-900 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Generate Mappings</h3>
                  <p className="text-slate-600 mb-6">
                    {sourceContract !== "none" && targetContract !== "none"
                      ? "AI will use your selected contracts to ensure mapping accuracy and compliance"
                      : "Click the button below to start AI analysis of your documents"}
                  </p>
                  <Button onClick={handleAIProcessing} className="bg-blue-900 hover:bg-blue-800">
                    <Brain className="mr-2 h-4 w-4" />
                    Generate AI Mappings
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Processing Documents...</h3>
                  <p className="text-slate-600 mb-4">
                    {sourceContract !== "none" && targetContract !== "none"
                      ? "Analyzing field structures, validating against contracts, and generating mappings"
                      : "Analyzing field structures and generating mappings"}
                  </p>
                  <div className="max-w-md mx-auto">
                    <Progress value={processingProgress} className="mb-2" />
                    <p className="text-sm text-slate-500">{processingProgress}% Complete</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Review Mappings */}
        <TabsContent value="step-4">
          <div className="space-y-6">
            {validationResults.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {validationResults.filter((r) => !r.isValid && r.severity === "error").length} validation errors and{" "}
                  {validationResults.filter((r) => !r.isValid && r.severity === "warning").length} warnings found.
                  Review the mappings below.
                </AlertDescription>
              </Alert>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Review Mapping Rules</CardTitle>
                <CardDescription>
                  Review and customize the AI-generated field mappings
                  {sourceContract !== "none" && targetContract !== "none" && " (validated against contracts)"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source Field</TableHead>
                      <TableHead>Target Field</TableHead>
                      <TableHead>Transformation</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Validation</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mappingRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.sourceField}</TableCell>
                        <TableCell>{rule.targetField}</TableCell>
                        <TableCell>{rule.transformation}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getConfidenceColor(rule.confidence)}`} />
                            {rule.confidence}%
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(rule.status)}</TableCell>
                        <TableCell>
                          {getValidationBadge(rule.validationStatus)}
                          {rule.validationMessage && (
                            <div className="text-xs text-slate-500 mt-1">{rule.validationMessage}</div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => confirmMapping(rule.id)}
                              disabled={rule.status === "confirmed"}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Back to AI Processing
                  </Button>
                  <Button onClick={() => setCurrentStep(5)} className="bg-blue-900 hover:bg-blue-800">
                    Save Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Step 5: Save Project */}
        <TabsContent value="step-5">
          <Card>
            <CardHeader>
              <CardTitle>Save Project Configuration</CardTitle>
              <CardDescription>Review and save your mapping project</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold text-green-800">Project Ready to Save</h3>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Project Name:</span>
                    <span className="ml-2 font-medium">{projectName}</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Mapping Rules:</span>
                    <span className="ml-2 font-medium">{mappingRules.length} fields</span>
                  </div>
                  <div>
                    <span className="text-slate-600">Confirmed Rules:</span>
                    <span className="ml-2 font-medium">
                      {mappingRules.filter((r) => r.status === "confirmed").length} of {mappingRules.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-600">Avg. Confidence:</span>
                    <span className="ml-2 font-medium">
                      {Math.round(mappingRules.reduce((acc, rule) => acc + rule.confidence, 0) / mappingRules.length)}%
                    </span>
                  </div>
                  {sourceContract !== "none" && (
                    <div>
                      <span className="text-slate-600">Source Contract:</span>
                      <span className="ml-2 font-medium">
                        {availableContracts.find((c) => c.id === sourceContract)?.info.title}
                      </span>
                    </div>
                  )}
                  {targetContract !== "none" && (
                    <div>
                      <span className="text-slate-600">Target Contract:</span>
                      <span className="ml-2 font-medium">
                        {availableContracts.find((c) => c.id === targetContract)?.info.title}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  Back to Review
                </Button>
                <Button className="bg-green-600 hover:bg-green-700">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Save Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
