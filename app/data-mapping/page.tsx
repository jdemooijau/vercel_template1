"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Upload, FileText, Brain, CheckCircle, Edit } from "lucide-react"

type MappingRule = {
  id: string
  sourceField: string
  targetField: string
  transformation: string
  confidence: number
  status: "suggested" | "confirmed" | "modified"
}

export default function DataMappingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [projectName, setProjectName] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([])

  const steps = [
    { number: 1, title: "Upload", description: "Upload documents and sample files" },
    { number: 2, title: "AI Mapping", description: "Generate AI-powered field mappings" },
    { number: 3, title: "Review", description: "Review and customize mappings" },
    { number: 4, title: "Save", description: "Save project configuration" },
  ]

  const handleAIProcessing = () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate AI processing
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          setCurrentStep(3)
          // Generate sample mapping rules
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
              transformation: "Validate Email",
              confidence: 98,
              status: "suggested",
            },
          ])
          return 100
        }
        return prev + 10
      })
    }, 300)
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI-Powered Data Mapping</h1>
        <p className="text-slate-600">Create intelligent field mappings with AI assistance</p>
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
        {/* Step 1: Upload */}
        <TabsContent value="step-1">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Configuration</CardTitle>
                <CardDescription>Enter project details and upload your documents</CardDescription>
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
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Source Document
                  </CardTitle>
                  <CardDescription>Upload source layout specification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">PDF, DOC, DOCX, TXT (Max 10MB)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Target Document
                  </CardTitle>
                  <CardDescription>Upload target format specification</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">PDF, DOC, DOCX, TXT (Max 10MB)</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Sample File
                  </CardTitle>
                  <CardDescription>Upload sample source data</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-slate-500">CSV, XLSX, JSON (Max 50MB)</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setCurrentStep(2)}
                disabled={!projectName}
                className="bg-blue-900 hover:bg-blue-800"
              >
                Continue to AI Mapping
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Step 2: AI Processing */}
        <TabsContent value="step-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Mapping Generation
              </CardTitle>
              <CardDescription>Our AI is analyzing your documents to generate field mappings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isProcessing && processingProgress === 0 ? (
                <div className="text-center py-8">
                  <Brain className="h-16 w-16 text-blue-900 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Ready to Generate Mappings</h3>
                  <p className="text-slate-600 mb-6">Click the button below to start AI analysis of your documents</p>
                  <Button onClick={handleAIProcessing} className="bg-blue-900 hover:bg-blue-800">
                    <Brain className="mr-2 h-4 w-4" />
                    Generate AI Mappings
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Processing Documents...</h3>
                  <p className="text-slate-600 mb-4">Analyzing field structures and generating mappings</p>
                  <div className="max-w-md mx-auto">
                    <Progress value={processingProgress} className="mb-2" />
                    <p className="text-sm text-slate-500">{processingProgress}% Complete</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 3: Review Mappings */}
        <TabsContent value="step-3">
          <Card>
            <CardHeader>
              <CardTitle>Review Mapping Rules</CardTitle>
              <CardDescription>Review and customize the AI-generated field mappings</CardDescription>
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
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  Back to AI Processing
                </Button>
                <Button onClick={() => setCurrentStep(4)} className="bg-blue-900 hover:bg-blue-800">
                  Save Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Step 4: Save Project */}
        <TabsContent value="step-4">
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
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
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
