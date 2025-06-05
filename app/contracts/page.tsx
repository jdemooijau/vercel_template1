"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { FileText, Plus, Search, Edit, Eye, Download, Upload } from "lucide-react"
import { FileUploadDialog } from "@/components/file-upload-dialog"
import { ContractAssignmentDialog } from "@/components/contract-assignment-dialog"
import { BusinessMetadataDialog } from "@/components/business-metadata-dialog"
// Import the enhanced contract view
import { EnhancedContractView } from "@/components/enhanced-contract-view"

type DataContract = {
  id: string
  title: string
  version: string
  description: string
  owner: string
  status: "draft" | "active" | "deprecated" | "archived"
  lastModified: string
  fieldCount: number
  usageCount: number
  yamlContent?: string
}

type UploadStatus = "idle" | "uploading" | "processing" | "completed" | "error"

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
  businessMetadata?: {
    owner: string
    steward: string
    domain: string
    classification: string
    usagePolicies: string[]
    businessDefinitions: Record<string, string>
    stakeholders: Array<{
      name: string
      role: string
      contact: string
    }>
    governance: {
      retentionPeriod: string
      accessLevel: string
      complianceRequirements: string[]
    }
  }
}

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedContract, setSelectedContract] = useState<DataContract | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isAssignmentOpen, setIsAssignmentOpen] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadMessage, setUploadMessage] = useState("")
  const [generatedContract, setGeneratedContract] = useState<GeneratedContract | null>(null)
  const [contracts, setContracts] = useState<DataContract[]>([
    {
      id: "customer-data-v1",
      title: "Customer Data Contract",
      version: "1.0.0",
      description: "Customer information from CRM system",
      owner: "Data Team",
      status: "active",
      lastModified: "2024-01-15",
      fieldCount: 12,
      usageCount: 5,
      yamlContent: `dataContractSpecification: 0.9.3
id: customer-data-v1
info:
  title: Customer Data Contract
  version: 1.0.0
  description: Customer information from CRM system
  owner: Data Team
models:
  customer:
    type: table
    description: Customer master data
    fields:
      id:
        type: integer
        required: true
        unique: true
        description: Unique customer identifier
      email:
        type: string
        required: true
        format: email
        pii: true
        classification: confidential
        description: Customer email address
      name:
        type: string
        required: true
        pii: true
        classification: confidential
        description: Customer full name`,
    },
    {
      id: "product-catalog-v1",
      title: "Product Catalog Contract",
      version: "1.0.0",
      description: "Product information for e-commerce platform",
      owner: "Product Team",
      status: "active",
      lastModified: "2024-01-12",
      fieldCount: 18,
      usageCount: 3,
    },
    {
      id: "financial-data-v2",
      title: "Financial Data Contract",
      version: "2.1.0",
      description: "Financial records and transaction data",
      owner: "Finance Team",
      status: "draft",
      lastModified: "2024-01-10",
      fieldCount: 25,
      usageCount: 0,
    },
    {
      id: "legacy-customer-v1",
      title: "Legacy Customer Contract",
      version: "1.0.0",
      description: "Deprecated customer data format",
      owner: "Data Team",
      status: "deprecated",
      lastModified: "2023-12-01",
      fieldCount: 8,
      usageCount: 1,
    },
  ])

  const [isBusinessMetadataOpen, setIsBusinessMetadataOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case "deprecated":
        return <Badge className="bg-orange-100 text-orange-800">Deprecated</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const filteredContracts = contracts.filter((contract) => {
    const matchesSearch =
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || contract.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const handleFileUpload = async (file: File, processingLibrary: "frictionless" | "datacontract-cli") => {
    setUploadStatus("uploading")
    setUploadProgress(20)
    setUploadMessage("Uploading file...")

    try {
      // Simulate file upload
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setUploadStatus("processing")
      setUploadProgress(50)
      setUploadMessage(`Processing with ${processingLibrary}...`)

      // Simulate processing with selected library
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Generate contract based on library choice
      const result = await generateContractFromFile(file, processingLibrary)
      setGeneratedContract(result)

      setUploadStatus("completed")
      setUploadProgress(100)
      setUploadMessage("Data contract generated successfully!")
    } catch (error) {
      setUploadStatus("error")
      setUploadMessage("Error processing file: " + (error as Error).message)
    }
  }

  const handleBusinessMetadataUpdate = (businessMetadata: any) => {
    if (generatedContract) {
      setGeneratedContract({
        ...generatedContract,
        businessMetadata,
      })
    }
  }

  const generateContractFromFile = async (
    file: File,
    library: "frictionless" | "datacontract-cli",
  ): Promise<GeneratedContract> => {
    const fileName = file.name.split(".")[0]
    const fileExtension = file.name.split(".").pop()?.toLowerCase()

    if (library === "frictionless") {
      return generateFrictionlessContract(file, fileName, fileExtension!)
    } else {
      return generateDataContractCliContract(file, fileName, fileExtension!)
    }
  }

  const generateFrictionlessContract = async (
    file: File,
    fileName: string,
    fileExtension: string,
  ): Promise<GeneratedContract> => {
    // Simulate frictionless-py analysis
    const mockSchema = {
      fields: [
        { name: "id", type: "integer", constraints: { required: true, unique: true } },
        { name: "name", type: "string", constraints: { required: true, maxLength: 100 } },
        { name: "email", type: "string", format: "email", constraints: { required: true } },
        { name: "age", type: "integer", constraints: { minimum: 0, maximum: 120 } },
        { name: "created_at", type: "datetime", constraints: { required: true } },
        { name: "is_active", type: "boolean", constraints: { required: true } },
      ],
      primaryKey: ["id"],
      missingValues: ["", "NULL", "null", "N/A"],
    }

    const mockQuality = {
      valid: true,
      stats: {
        rows: 1250,
        fields: 6,
        errors: 0,
        warnings: 2,
      },
      fieldStats: {
        completeness: 98.5,
        uniqueness: 95.2,
        validity: 99.1,
      },
    }

    const warnings = [
      "2 rows contain missing values in non-required fields",
      "Email format validation passed for 99.8% of records",
    ]

    const yaml = `# Generated using frictionless-py data profiling
# Source: ${file.name}
# Generated: ${new Date().toISOString()}

dataContractSpecification: 0.9.3
id: ${fileName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-contract
info:
  title: ${fileName} Data Contract
  version: 1.0.0
  description: Auto-generated contract from ${fileExtension.toUpperCase()} using frictionless-py
  owner: Data Team
  contact:
    name: Data Engineering Team
    email: data-engineering@company.com
  tags:
    - frictionless-generated
    - ${fileExtension}
    - validated

servers:
  production:
    type: ${fileExtension === "csv" ? "s3" : "bigquery"}
    format: ${fileExtension}
    description: Production data source
    
terms:
  usage: |
    This contract was generated using frictionless-py data profiling.
    Schema validation and quality checks have been performed.
  limitations: |
    - Based on sample data analysis (${mockQuality.stats.rows} rows)
    - Field constraints inferred from data patterns
    - Manual review recommended for business rules

models:
  ${fileName.toLowerCase().replace(/[^a-z0-9]/g, "_")}:
    type: table
    description: ${fileName} data model (frictionless validated)
    primaryKey: [${mockSchema.primaryKey.map((k) => `"${k}"`).join(", ")}]
    fields:
      id:
        type: integer
        required: true
        unique: true
        description: Primary key identifier
        constraints:
          minimum: 1
      name:
        type: string
        required: true
        description: Record name
        constraints:
          maxLength: 100
          pattern: "^[A-Za-z\\s]+$"
      email:
        type: string
        required: true
        format: email
        pii: true
        classification: confidential
        description: Email address
        constraints:
          pattern: "^[\\w\\.-]+@[\\w\\.-]+\\.[a-zA-Z]{2,}$"
      age:
        type: integer
        required: false
        description: Age in years
        constraints:
          minimum: 0
          maximum: 120
      created_at:
        type: timestamp
        required: true
        description: Record creation timestamp
        format: "YYYY-MM-DD HH:mm:ss"
      is_active:
        type: boolean
        required: true
        description: Active status flag
        default: true

quality:
  # Frictionless validation results
  completeness:
    threshold: ${mockQuality.fieldStats.completeness}
    description: Data completeness based on frictionless analysis
  accuracy:
    threshold: ${mockQuality.fieldStats.validity}
    description: Data validity based on schema validation
  uniqueness:
    threshold: ${mockQuality.fieldStats.uniqueness}
    description: Uniqueness constraints validation
  freshness:
    threshold: "24h"
    description: Data freshness requirement
  validation:
    engine: "frictionless-py"
    lastRun: "${new Date().toISOString()}"
    results:
      totalRows: ${mockQuality.stats.rows}
      validRows: ${mockQuality.stats.rows - mockQuality.stats.errors}
      errorCount: ${mockQuality.stats.errors}
      warningCount: ${mockQuality.stats.warnings}

serviceLevel:
  availability: "99.9%"
  retention: "7 years"
  latency: "< 100ms"
  support: "24x7"
  backup: "daily"

# Frictionless validation metadata
metadata:
  generator: "frictionless-py"
  validation:
    schema: "inferred"
    dialect: "auto-detected"
    encoding: "utf-8"
  quality:
    score: ${((mockQuality.fieldStats.completeness + mockQuality.fieldStats.validity + mockQuality.fieldStats.uniqueness) / 3).toFixed(1)}
    issues: ${mockQuality.stats.warnings} warnings, ${mockQuality.stats.errors} errors`

    return {
      yaml,
      metadata: {
        fileName: file.name,
        fileType: fileExtension,
        recordCount: mockQuality.stats.rows,
        fieldCount: mockSchema.fields.length,
        inferredSchema: mockSchema,
        quality: mockQuality,
        warnings,
        errors: [],
      },
    }
  }

  const generateDataContractCliContract = async (
    file: File,
    fileName: string,
    fileExtension: string,
  ): Promise<GeneratedContract> => {
    // Simulate datacontract-cli processing
    const warnings =
      fileExtension === "csv"
        ? [
            "CSV headers used as field names - verify schema accuracy",
            "Data types inferred from sample - manual review recommended",
          ]
        : ["Schema inferred from file structure", "Consider adding business validation rules"]

    const yaml = `# Generated using datacontract-cli
# Source: ${file.name}
# Generated: ${new Date().toISOString()}

dataContractSpecification: 0.9.3
id: ${fileName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-contract
info:
  title: ${fileName} Data Contract
  version: 1.0.0
  description: Auto-generated contract from ${fileExtension.toUpperCase()} using datacontract-cli
  owner: Data Team
  contact:
    name: Data Engineering Team
    email: data-engineering@company.com
  tags:
    - datacontract-cli-generated
    - ${fileExtension}

servers:
  production:
    type: ${fileExtension === "csv" ? "s3" : fileExtension === "json" ? "kafka" : "bigquery"}
    format: ${fileExtension}
    description: Production data source

models:
  ${fileName.toLowerCase().replace(/[^a-z0-9]/g, "_")}:
    type: ${fileExtension === "json" ? "object" : "table"}
    description: ${fileName} data model
    fields:
      id:
        type: string
        required: true
        unique: true
        description: Unique identifier
      timestamp:
        type: timestamp
        required: true
        description: Record timestamp
      data:
        type: ${fileExtension === "json" ? "object" : "string"}
        required: true
        description: Main data field

quality:
  completeness:
    threshold: 95
    description: Data completeness requirement
  freshness:
    threshold: "24h"
    description: Data freshness requirement

serviceLevel:
  availability: "99.5%"
  retention: "5 years"
  support: "8x5"`

    return {
      yaml,
      metadata: {
        fileName: file.name,
        fileType: fileExtension,
        fieldCount: 3,
        inferredSchema: { basic: true },
        warnings,
        errors: [],
      },
    }
  }

  const handleContractAssignment = (assignmentType: "new" | "existing", contractData?: any) => {
    if (!generatedContract) return

    if (assignmentType === "new") {
      // Create new contract
      const newContract: DataContract = {
        id: contractData.id,
        title: contractData.title,
        version: contractData.version,
        description: contractData.description,
        owner: contractData.owner,
        status: "draft",
        lastModified: new Date().toISOString().split("T")[0],
        fieldCount: generatedContract.metadata.fieldCount,
        usageCount: 0,
        yamlContent: generatedContract.yaml,
      }
      setContracts([...contracts, newContract])
      setSelectedContract(newContract)
    } else {
      // Update existing contract
      const updatedContracts = contracts.map((contract) =>
        contract.id === contractData.contractId
          ? {
              ...contract,
              yamlContent: generatedContract.yaml,
              fieldCount: generatedContract.metadata.fieldCount,
              lastModified: new Date().toISOString().split("T")[0],
              version: contractData.newVersion || contract.version,
            }
          : contract,
      )
      setContracts(updatedContracts)
      const updatedContract = updatedContracts.find((c) => c.id === contractData.contractId)
      if (updatedContract) setSelectedContract(updatedContract)
    }

    setIsAssignmentOpen(false)
    setIsUploadOpen(false)
    resetUpload()
  }

  const downloadYaml = () => {
    if (!generatedContract) return
    const blob = new Blob([generatedContract.yaml], { type: "text/yaml" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${generatedContract.metadata.fileName.split(".")[0]}-contract.yaml`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const resetUpload = () => {
    setUploadStatus("idle")
    setUploadProgress(0)
    setUploadMessage("")
    setGeneratedContract(null)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Contracts</h1>
        <p className="text-slate-600">Define and manage data source semantics and expectations</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Contract Management
              </CardTitle>
              <CardDescription>Search, filter, and manage your data contracts</CardDescription>
            </div>
            <div className="flex gap-2">
              <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={resetUpload}>
                    <Upload className="mr-2 h-4 w-4" />
                    Infer from File
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Generate Contract from Sample File</DialogTitle>
                    <DialogDescription>
                      Upload a sample data file to automatically generate a data contract using frictionless-py or
                      datacontract-cli
                    </DialogDescription>
                  </DialogHeader>

                  <FileUploadDialog
                    onFileUpload={handleFileUpload}
                    uploadStatus={uploadStatus}
                    uploadProgress={uploadProgress}
                    uploadMessage={uploadMessage}
                    generatedContract={generatedContract}
                    onDownloadYaml={downloadYaml}
                    onReset={resetUpload}
                    onAssignContract={() => setIsAssignmentOpen(true)}
                    onAddBusinessContext={() => setIsBusinessMetadataOpen(true)}
                  />
                </DialogContent>
              </Dialog>

              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-900 hover:bg-blue-800">
                    <Plus className="mr-2 h-4 w-4" />
                    New Contract
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Data Contract</DialogTitle>
                    <DialogDescription>
                      Define a new data contract with field specifications and validation rules
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contract-title">Contract Title</Label>
                        <Input id="contract-title" placeholder="e.g., Customer Data Contract" />
                      </div>
                      <div>
                        <Label htmlFor="contract-version">Version</Label>
                        <Input id="contract-version" placeholder="1.0.0" />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="contract-description">Description</Label>
                      <Textarea
                        id="contract-description"
                        placeholder="Describe the purpose and scope of this data contract"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contract-owner">Owner</Label>
                        <Input id="contract-owner" placeholder="Team or individual responsible" />
                      </div>
                      <div>
                        <Label htmlFor="contract-status">Status</Label>
                        <Select defaultValue="draft">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="draft">Draft</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="deprecated">Deprecated</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <Label>Contract Schema</Label>
                      <Textarea
                        placeholder="Define your data schema in JSON format..."
                        rows={8}
                        className="font-mono text-sm"
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button className="flex-1" onClick={() => setIsCreateOpen(false)}>
                        Create Contract
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search contracts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contracts List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Data Contracts</CardTitle>
              <CardDescription>
                Showing {filteredContracts.length} of {contracts.length} contracts
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contract</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Fields</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContracts.map((contract) => (
                    <TableRow
                      key={contract.id}
                      className="cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelectedContract(contract)}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">{contract.title}</div>
                          <div className="text-sm text-slate-500">v{contract.version}</div>
                        </div>
                      </TableCell>
                      <TableCell>{contract.owner}</TableCell>
                      <TableCell>{getStatusBadge(contract.status)}</TableCell>
                      <TableCell>{contract.fieldCount} fields</TableCell>
                      <TableCell>{contract.usageCount} projects</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4" />
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
        </div>

        {/* Contract Details */}
        <div>
          {selectedContract ? (
            <EnhancedContractView
              contract={selectedContract}
              onEdit={() => {
                // Handle edit action
                console.log("Edit contract:", selectedContract.id)
              }}
              onDownload={() => {
                if (selectedContract.yamlContent) {
                  const blob = new Blob([selectedContract.yamlContent], { type: "text/yaml" })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement("a")
                  a.href = url
                  a.download = `${selectedContract.id}.yaml`
                  document.body.appendChild(a)
                  a.click()
                  document.body.removeChild(a)
                  URL.revokeObjectURL(url)
                }
              }}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Select a contract to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contract Assignment Dialog */}
      <ContractAssignmentDialog
        open={isAssignmentOpen}
        onOpenChange={setIsAssignmentOpen}
        generatedContract={generatedContract}
        existingContracts={contracts}
        onAssign={handleContractAssignment}
      />

      {/* Business Metadata Dialog */}
      <BusinessMetadataDialog
        open={isBusinessMetadataOpen}
        onOpenChange={setIsBusinessMetadataOpen}
        generatedContract={generatedContract}
        onSave={handleBusinessMetadataUpdate}
      />
    </div>
  )
}
