"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  FileText,
  Users,
  Shield,
  BookOpen,
  Crown,
  UserCheck,
  Calendar,
  Scale,
  Globe,
  Building,
  Lock,
  Download,
  Edit,
  Info,
  AlertTriangle,
} from "lucide-react"

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

interface EnhancedContractViewProps {
  contract: DataContract
  onEdit?: () => void
  onDownload?: () => void
}

export function EnhancedContractView({ contract, onEdit, onDownload }: EnhancedContractViewProps) {
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

  const getClassificationIcon = (classification: string) => {
    switch (classification) {
      case "public":
        return <Globe className="h-4 w-4 text-green-600" />
      case "internal":
        return <Building className="h-4 w-4 text-blue-600" />
      case "confidential":
        return <Lock className="h-4 w-4 text-orange-600" />
      case "restricted":
        return <Shield className="h-4 w-4 text-red-600" />
      default:
        return <Building className="h-4 w-4 text-gray-600" />
    }
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

  const hasBusinessMetadata = contract.businessMetadata && Object.keys(contract.businessMetadata).length > 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Contract Details
            </CardTitle>
            {!hasBusinessMetadata && (
              <Alert className="mt-2 border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800 text-sm">
                  This contract is missing business context. Consider adding ownership and governance details.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-lg">{contract.title}</h3>
          <p className="text-sm text-slate-600 mb-2">Version {contract.version}</p>
          <div className="flex items-center gap-2">
            {getStatusBadge(contract.status)}
            {hasBusinessMetadata && contract.businessMetadata?.classification && (
              <Badge className={`border ${getClassificationColor(contract.businessMetadata.classification)}`}>
                {getClassificationIcon(contract.businessMetadata.classification)}
                <span className="ml-1 capitalize">{contract.businessMetadata.classification}</span>
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <Label className="text-xs text-slate-600">Fields</Label>
            <p className="font-medium">{contract.fieldCount}</p>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Usage</Label>
            <p className="font-medium">{contract.usageCount} projects</p>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Last Modified</Label>
            <p className="font-medium">{contract.lastModified}</p>
          </div>
          <div>
            <Label className="text-xs text-slate-600">Business Context</Label>
            <p className="font-medium">{hasBusinessMetadata ? "Complete" : "Missing"}</p>
          </div>
        </div>

        <Separator />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="governance">Governance</TabsTrigger>
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="yaml">YAML</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div>
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm text-slate-600">{contract.description}</p>
            </div>

            {hasBusinessMetadata && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">Data Owner</Label>
                    <p className="text-sm text-slate-600">{contract.businessMetadata?.owner || "Not specified"}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Business Domain</Label>
                    <p className="text-sm text-slate-600 capitalize">
                      {contract.businessMetadata?.domain || "Not specified"}
                    </p>
                  </div>
                </div>

                {contract.businessMetadata?.usagePolicies && contract.businessMetadata.usagePolicies.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Key Usage Policies</Label>
                    <ul className="text-sm text-slate-600 mt-1 space-y-1">
                      {contract.businessMetadata.usagePolicies.slice(0, 3).map((policy, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-slate-400">•</span>
                          <span>{policy}</span>
                        </li>
                      ))}
                      {contract.businessMetadata.usagePolicies.length > 3 && (
                        <li className="text-slate-400 text-xs">
                          +{contract.businessMetadata.usagePolicies.length - 3} more policies
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="business" className="mt-4 space-y-4">
            {hasBusinessMetadata ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Crown className="h-4 w-4" />
                      Data Owner
                    </Label>
                    <p className="text-sm text-slate-600">{contract.businessMetadata?.owner}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <UserCheck className="h-4 w-4" />
                      Data Steward
                    </Label>
                    <p className="text-sm text-slate-600">{contract.businessMetadata?.steward}</p>
                  </div>
                </div>

                {contract.businessMetadata?.businessDefinitions &&
                  Object.keys(contract.businessMetadata.businessDefinitions).length > 0 && (
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        Business Definitions
                      </Label>
                      <ScrollArea className="h-32 w-full rounded border p-2 mt-2">
                        <div className="space-y-2">
                          {Object.entries(contract.businessMetadata.businessDefinitions).map(([field, definition]) => (
                            <div key={field} className="text-sm">
                              <span className="font-medium">{field}:</span>
                              <span className="text-slate-600 ml-2">{definition}</span>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}

                {contract.businessMetadata?.stakeholders && contract.businessMetadata.stakeholders.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      Stakeholders
                    </Label>
                    <div className="space-y-2 mt-2">
                      {contract.businessMetadata.stakeholders.map((stakeholder, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <UserCheck className="h-3 w-3 text-slate-400" />
                          <span className="font-medium">{stakeholder.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {stakeholder.role}
                          </Badge>
                          {stakeholder.contact && <span className="text-slate-600">({stakeholder.contact})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No business context has been defined for this contract. Add ownership, definitions, and stakeholder
                  information to make this contract more useful.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="governance" className="mt-4 space-y-4">
            {hasBusinessMetadata && contract.businessMetadata?.governance ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Retention Period
                    </Label>
                    <p className="text-sm text-slate-600">
                      {contract.businessMetadata.governance.retentionPeriod || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Lock className="h-4 w-4" />
                      Access Level
                    </Label>
                    <p className="text-sm text-slate-600 capitalize">
                      {contract.businessMetadata.governance.accessLevel || "Not specified"}
                    </p>
                  </div>
                </div>

                {contract.businessMetadata.usagePolicies && contract.businessMetadata.usagePolicies.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Usage Policies</Label>
                    <ul className="text-sm text-slate-600 mt-2 space-y-1">
                      {contract.businessMetadata.usagePolicies.map((policy, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-slate-400">•</span>
                          <span>{policy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {contract.businessMetadata.governance.complianceRequirements &&
                  contract.businessMetadata.governance.complianceRequirements.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-1">
                        <Scale className="h-4 w-4" />
                        Compliance Requirements
                      </Label>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {contract.businessMetadata.governance.complianceRequirements.map((req) => (
                          <Badge key={req} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </>
            ) : (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  No governance information has been defined for this contract. Add retention policies, access controls,
                  and compliance requirements.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="technical" className="mt-4">
            <ScrollArea className="h-48 w-full rounded border p-3">
              <pre className="text-xs">
                {`{
  "${contract.title.toLowerCase().replace(/\s+/g, "_")}": {
    "type": "table",
    "fields": {
      "id": {
        "type": "integer",
        "required": true
      },
      "created_at": {
        "type": "timestamp",
        "required": true
      }
    }
  }
}`}
              </pre>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="yaml" className="mt-4">
            <ScrollArea className="h-48 w-full rounded border p-3">
              <pre className="text-xs whitespace-pre-wrap">{contract.yamlContent || "No YAML content available"}</pre>
            </ScrollArea>
            {contract.yamlContent && (
              <Button size="sm" variant="outline" className="mt-2" onClick={onDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download YAML
              </Button>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
