"use client"

import { CardDescription } from "@/components/ui/card"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Users,
  Shield,
  BookOpen,
  Building,
  Plus,
  Trash2,
  Info,
  CheckCircle,
  Crown,
  UserCheck,
  Globe,
  Lock,
  Scale,
} from "lucide-react"

type BusinessMetadata = {
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
  businessMetadata?: BusinessMetadata
}

interface BusinessMetadataDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  generatedContract: GeneratedContract | null
  onSave: (businessMetadata: BusinessMetadata) => void
}

export function BusinessMetadataDialog({ open, onOpenChange, generatedContract, onSave }: BusinessMetadataDialogProps) {
  const [businessMetadata, setBusinessMetadata] = useState<BusinessMetadata>({
    owner: "",
    steward: "",
    domain: "",
    classification: "internal",
    usagePolicies: [],
    businessDefinitions: {},
    stakeholders: [],
    governance: {
      retentionPeriod: "",
      accessLevel: "restricted",
      complianceRequirements: [],
    },
  })

  const [newPolicy, setNewPolicy] = useState("")
  const [newDefinitionField, setNewDefinitionField] = useState("")
  const [newDefinitionValue, setNewDefinitionValue] = useState("")
  const [newStakeholder, setNewStakeholder] = useState({ name: "", role: "", contact: "" })
  const [newComplianceReq, setNewComplianceReq] = useState("")

  if (!generatedContract) return null

  const dataClassifications = [
    { value: "public", label: "Public", description: "Publicly available information", icon: Globe },
    { value: "internal", label: "Internal", description: "Internal company use only", icon: Building },
    { value: "confidential", label: "Confidential", description: "Sensitive business information", icon: Lock },
    { value: "restricted", label: "Restricted", description: "Highly sensitive, limited access", icon: Shield },
  ]

  const accessLevels = [
    { value: "public", label: "Public Access", description: "Available to all users" },
    { value: "internal", label: "Internal Access", description: "Company employees only" },
    { value: "restricted", label: "Restricted Access", description: "Specific roles/teams only" },
    { value: "confidential", label: "Confidential Access", description: "Senior management only" },
  ]

  const stakeholderRoles = [
    "Data Owner",
    "Data Steward",
    "Business Analyst",
    "Data Engineer",
    "Compliance Officer",
    "Product Manager",
    "Domain Expert",
    "End User",
  ]

  const commonDomains = [
    "Customer",
    "Product",
    "Financial",
    "Operations",
    "Marketing",
    "Sales",
    "Human Resources",
    "Supply Chain",
    "Compliance",
    "Analytics",
  ]

  const commonComplianceReqs = [
    "GDPR",
    "CCPA",
    "HIPAA",
    "SOX",
    "PCI DSS",
    "ISO 27001",
    "SOC 2",
    "FERPA",
    "PIPEDA",
    "Data Residency",
  ]

  const addPolicy = () => {
    if (newPolicy.trim()) {
      setBusinessMetadata({
        ...businessMetadata,
        usagePolicies: [...businessMetadata.usagePolicies, newPolicy.trim()],
      })
      setNewPolicy("")
    }
  }

  const removePolicy = (index: number) => {
    setBusinessMetadata({
      ...businessMetadata,
      usagePolicies: businessMetadata.usagePolicies.filter((_, i) => i !== index),
    })
  }

  const addDefinition = () => {
    if (newDefinitionField.trim() && newDefinitionValue.trim()) {
      setBusinessMetadata({
        ...businessMetadata,
        businessDefinitions: {
          ...businessMetadata.businessDefinitions,
          [newDefinitionField.trim()]: newDefinitionValue.trim(),
        },
      })
      setNewDefinitionField("")
      setNewDefinitionValue("")
    }
  }

  const removeDefinition = (field: string) => {
    const { [field]: removed, ...rest } = businessMetadata.businessDefinitions
    setBusinessMetadata({
      ...businessMetadata,
      businessDefinitions: rest,
    })
  }

  const addStakeholder = () => {
    if (newStakeholder.name.trim() && newStakeholder.role.trim()) {
      setBusinessMetadata({
        ...businessMetadata,
        stakeholders: [...businessMetadata.stakeholders, { ...newStakeholder }],
      })
      setNewStakeholder({ name: "", role: "", contact: "" })
    }
  }

  const removeStakeholder = (index: number) => {
    setBusinessMetadata({
      ...businessMetadata,
      stakeholders: businessMetadata.stakeholders.filter((_, i) => i !== index),
    })
  }

  const addComplianceReq = () => {
    if (newComplianceReq.trim() && !businessMetadata.governance.complianceRequirements.includes(newComplianceReq)) {
      setBusinessMetadata({
        ...businessMetadata,
        governance: {
          ...businessMetadata.governance,
          complianceRequirements: [...businessMetadata.governance.complianceRequirements, newComplianceReq],
        },
      })
      setNewComplianceReq("")
    }
  }

  const removeComplianceReq = (requirement: string) => {
    setBusinessMetadata({
      ...businessMetadata,
      governance: {
        ...businessMetadata.governance,
        complianceRequirements: businessMetadata.governance.complianceRequirements.filter((req) => req !== requirement),
      },
    })
  }

  const handleSave = () => {
    onSave(businessMetadata)
    onOpenChange(false)
  }

  const getClassificationIcon = (classification: string) => {
    const classificationData = dataClassifications.find((c) => c.value === classification)
    const Icon = classificationData?.icon || Building
    return <Icon className="h-4 w-4" />
  }

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "public":
        return "text-green-600 bg-green-50 border-green-200"
      case "internal":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "confidential":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "restricted":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Add Business Context & Governance
          </DialogTitle>
          <DialogDescription>
            Enhance the technical data contract with business semantics, ownership, and governance information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Contract Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Technical Contract Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-slate-600">Source File</Label>
                  <p className="font-medium">{generatedContract.metadata.fileName}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">File Type</Label>
                  <p className="font-medium">{generatedContract.metadata.fileType.toUpperCase()}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Fields</Label>
                  <p className="font-medium">{generatedContract.metadata.fieldCount}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Records</Label>
                  <p className="font-medium">{generatedContract.metadata.recordCount?.toLocaleString() || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="ownership" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="ownership">Ownership</TabsTrigger>
              <TabsTrigger value="classification">Classification</TabsTrigger>
              <TabsTrigger value="definitions">Definitions</TabsTrigger>
              <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
              <TabsTrigger value="governance">Governance</TabsTrigger>
            </TabsList>

            {/* Ownership Tab */}
            <TabsContent value="ownership" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Data Ownership & Stewardship
                  </CardTitle>
                  <CardDescription>Define who owns and manages this data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="owner">Data Owner *</Label>
                      <Input
                        id="owner"
                        value={businessMetadata.owner}
                        onChange={(e) => setBusinessMetadata({ ...businessMetadata, owner: e.target.value })}
                        placeholder="e.g., John Smith, VP of Sales"
                      />
                      <p className="text-xs text-slate-600 mt-1">
                        Person accountable for data quality and business decisions
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="steward">Data Steward *</Label>
                      <Input
                        id="steward"
                        value={businessMetadata.steward}
                        onChange={(e) => setBusinessMetadata({ ...businessMetadata, steward: e.target.value })}
                        placeholder="e.g., Jane Doe, Data Analyst"
                      />
                      <p className="text-xs text-slate-600 mt-1">Person responsible for day-to-day data management</p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="domain">Business Domain *</Label>
                    <Select
                      value={businessMetadata.domain}
                      onValueChange={(value) => setBusinessMetadata({ ...businessMetadata, domain: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select business domain" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonDomains.map((domain) => (
                          <SelectItem key={domain} value={domain.toLowerCase()}>
                            {domain}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-600 mt-1">Business area or department that owns this data</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Classification Tab */}
            <TabsContent value="classification" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Data Classification & Usage Policies
                  </CardTitle>
                  <CardDescription>Define data sensitivity and usage restrictions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label className="text-sm font-medium mb-3 block">Data Classification *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {dataClassifications.map((classification) => {
                        const Icon = classification.icon
                        const isSelected = businessMetadata.classification === classification.value
                        return (
                          <div
                            key={classification.value}
                            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                              isSelected
                                ? getClassificationColor(classification.value)
                                : "border-slate-200 hover:border-slate-300"
                            }`}
                            onClick={() =>
                              setBusinessMetadata({ ...businessMetadata, classification: classification.value })
                            }
                          >
                            <div className="flex items-start gap-3">
                              <Icon className={`h-5 w-5 mt-0.5 ${isSelected ? "" : "text-slate-400"}`} />
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium text-sm">{classification.label}</h3>
                                  {isSelected && (
                                    <Badge variant="secondary" className="text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-slate-600 mt-1">{classification.description}</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Usage Policies</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newPolicy}
                          onChange={(e) => setNewPolicy(e.target.value)}
                          placeholder="e.g., Data can only be used for customer analytics"
                          onKeyPress={(e) => e.key === "Enter" && addPolicy()}
                        />
                        <Button onClick={addPolicy} disabled={!newPolicy.trim()}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {businessMetadata.usagePolicies.length > 0 && (
                        <div className="space-y-2">
                          {businessMetadata.usagePolicies.map((policy, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                              <span className="flex-1 text-sm">{policy}</span>
                              <Button size="sm" variant="ghost" onClick={() => removePolicy(index)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Definitions Tab */}
            <TabsContent value="definitions" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Business Definitions & Context
                  </CardTitle>
                  <CardDescription>Define business meanings for fields and terms</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Add business definitions for technical field names to help users understand the data context.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={newDefinitionField}
                        onChange={(e) => setNewDefinitionField(e.target.value)}
                        placeholder="Field name (e.g., customer_id)"
                      />
                      <Input
                        value={newDefinitionValue}
                        onChange={(e) => setNewDefinitionValue(e.target.value)}
                        placeholder="Business definition"
                        onKeyPress={(e) => e.key === "Enter" && addDefinition()}
                      />
                    </div>
                    <Button onClick={addDefinition} disabled={!newDefinitionField.trim() || !newDefinitionValue.trim()}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Definition
                    </Button>
                  </div>

                  {Object.keys(businessMetadata.businessDefinitions).length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Business Definitions</Label>
                      <ScrollArea className="h-48 w-full rounded border p-3">
                        <div className="space-y-3">
                          {Object.entries(businessMetadata.businessDefinitions).map(([field, definition]) => (
                            <div key={field} className="p-3 bg-slate-50 rounded">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{field}</h4>
                                  <p className="text-sm text-slate-600 mt-1">{definition}</p>
                                </div>
                                <Button size="sm" variant="ghost" onClick={() => removeDefinition(field)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Stakeholders Tab */}
            <TabsContent value="stakeholders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Stakeholders & Contacts
                  </CardTitle>
                  <CardDescription>Identify key people involved with this data</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        value={newStakeholder.name}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, name: e.target.value })}
                        placeholder="Name"
                      />
                      <Select
                        value={newStakeholder.role}
                        onValueChange={(value) => setNewStakeholder({ ...newStakeholder, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          {stakeholderRoles.map((role) => (
                            <SelectItem key={role} value={role}>
                              {role}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        value={newStakeholder.contact}
                        onChange={(e) => setNewStakeholder({ ...newStakeholder, contact: e.target.value })}
                        placeholder="Email or contact"
                      />
                    </div>
                    <Button
                      onClick={addStakeholder}
                      disabled={!newStakeholder.name.trim() || !newStakeholder.role.trim()}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Stakeholder
                    </Button>
                  </div>

                  {businessMetadata.stakeholders.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Stakeholders</Label>
                      <div className="space-y-2">
                        {businessMetadata.stakeholders.map((stakeholder, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                            <UserCheck className="h-4 w-4 text-slate-600" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{stakeholder.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {stakeholder.role}
                                </Badge>
                              </div>
                              {stakeholder.contact && <p className="text-xs text-slate-600">{stakeholder.contact}</p>}
                            </div>
                            <Button size="sm" variant="ghost" onClick={() => removeStakeholder(index)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Governance Tab */}
            <TabsContent value="governance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    Governance & Compliance
                  </CardTitle>
                  <CardDescription>Define retention, access controls, and compliance requirements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="retention">Data Retention Period</Label>
                      <Input
                        id="retention"
                        value={businessMetadata.governance.retentionPeriod}
                        onChange={(e) =>
                          setBusinessMetadata({
                            ...businessMetadata,
                            governance: { ...businessMetadata.governance, retentionPeriod: e.target.value },
                          })
                        }
                        placeholder="e.g., 7 years, 90 days"
                      />
                      <p className="text-xs text-slate-600 mt-1">How long should this data be retained?</p>
                    </div>

                    <div>
                      <Label htmlFor="access-level">Access Level</Label>
                      <Select
                        value={businessMetadata.governance.accessLevel}
                        onValueChange={(value) =>
                          setBusinessMetadata({
                            ...businessMetadata,
                            governance: { ...businessMetadata.governance, accessLevel: value },
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {accessLevels.map((level) => (
                            <SelectItem key={level.value} value={level.value}>
                              <div>
                                <div className="font-medium">{level.label}</div>
                                <div className="text-xs text-slate-600">{level.description}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Compliance Requirements</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Select value={newComplianceReq} onValueChange={setNewComplianceReq}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select compliance requirement" />
                          </SelectTrigger>
                          <SelectContent>
                            {commonComplianceReqs.map((req) => (
                              <SelectItem key={req} value={req}>
                                {req}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={addComplianceReq} disabled={!newComplianceReq}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {businessMetadata.governance.complianceRequirements.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {businessMetadata.governance.complianceRequirements.map((req) => (
                            <Badge key={req} variant="outline" className="flex items-center gap-1">
                              {req}
                              <button onClick={() => removeComplianceReq(req)} className="ml-1 hover:text-red-600">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Business Context Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <Label className="text-xs text-slate-600">Owner</Label>
                  <p className="font-medium">{businessMetadata.owner || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Domain</Label>
                  <p className="font-medium">{businessMetadata.domain || "Not specified"}</p>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Classification</Label>
                  <div className="flex items-center gap-1">
                    {getClassificationIcon(businessMetadata.classification)}
                    <span className="font-medium capitalize">{businessMetadata.classification}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-slate-600">Stakeholders</Label>
                  <p className="font-medium">{businessMetadata.stakeholders.length} defined</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!businessMetadata.owner || !businessMetadata.steward || !businessMetadata.domain}
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Save Business Context
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
