"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Plus, Search, DollarSign, Clock, CheckCircle, AlertTriangle, Bot } from "lucide-react"
import type { DataContract } from "@/types/data-contract"
import { DataContractEngine } from "@/lib/data-contract-engine"

export default function DataContractsPage() {
  const [contracts, setContracts] = useState<DataContract[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedContract, setSelectedContract] = useState<DataContract | null>(null)
  const [isEnriching, setIsEnriching] = useState(false)
  const [enrichmentProgress, setEnrichmentProgress] = useState(0)
  const [contractEngine] = useState(() => new DataContractEngine())

  useEffect(() => {
    // Load sample contracts
    loadSampleContracts()
  }, [])

  const loadSampleContracts = async () => {
    const sampleContract = await contractEngine.createContract({
      id: "customer-data-v1",
      info: {
        title: "Customer Data Contract",
        version: "1.0.0",
        description: "Customer information from CRM system",
        owner: "Data Team",
        contact: {
          name: "John Smith",
          email: "john.smith@company.com",
        },
        tags: ["customer", "crm", "pii"],
      },
      servers: {
        production: {
          type: "postgres",
          host: "prod-db.company.com",
          database: "crm",
          schema: "public",
          environment: "prod",
          location: "us-east-1",
        },
      },
      models: {
        customer: {
          type: "table",
          description: "Customer master data",
          fields: {
            id: {
              type: "integer",
              description: "Unique customer identifier",
              required: true,
              unique: true,
            },
            email: {
              type: "string",
              description: "Customer email address",
              required: true,
              format: "email",
              pii: true,
              classification: "confidential",
            },
            name: {
              type: "string",
              description: "Customer full name",
              required: true,
              pii: true,
              classification: "confidential",
            },
            created_at: {
              type: "timestamp",
              description: "Account creation timestamp",
              required: true,
            },
          },
        },
      },
    })

    setContracts([sampleContract])
  }

  const handleEnrichContract = async (contractId: string) => {
    setIsEnriching(true)
    setEnrichmentProgress(0)

    // Simulate enrichment progress
    const interval = setInterval(() => {
      setEnrichmentProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsEnriching(false)
          // Refresh contracts
          setContracts(contractEngine.getAllContracts())
          return 100
        }
        return prev + 20
      })
    }, 500)

    await contractEngine.enrichContract(contractId)
  }

  const filteredContracts = contracts.filter(
    (contract) =>
      contract.info.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.info.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getQualityScore = (contract: DataContract): number => {
    if (!contract.quality) return 0
    const rules = [
      ...(contract.quality.accuracy || []),
      ...(contract.quality.completeness || []),
      ...(contract.quality.consistency || []),
      ...(contract.quality.uniqueness || []),
    ]
    return rules.length > 0
      ? Math.round((rules.reduce((acc, rule) => acc + (rule.threshold || 0), 0) / rules.length) * 100)
      : 0
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Contracts</h1>
        <p className="text-slate-600">Define, manage, and enrich data source semantics with AI-powered insights</p>
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
              <CardDescription>Search and manage your data contracts</CardDescription>
            </div>
            <Button className="bg-blue-900 hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              New Contract
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Search contracts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contracts List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredContracts.map((contract) => (
            <Card
              key={contract.id}
              className={`cursor-pointer transition-colors ${
                selectedContract?.id === contract.id ? "ring-2 ring-blue-500" : "hover:bg-slate-50"
              }`}
              onClick={() => setSelectedContract(contract)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{contract.info.title}</CardTitle>
                    <CardDescription>{contract.info.description}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">v{contract.info.version}</Badge>
                    {contract.quality && (
                      <Badge className="bg-green-100 text-green-800">{getQualityScore(contract)}% Quality</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span>Owner: {contract.info.owner}</span>
                    <span>Models: {Object.keys(contract.models).length}</span>
                    {contract.info.tags && (
                      <div className="flex gap-1">
                        {contract.info.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEnrichContract(contract.id)
                    }}
                    disabled={isEnriching}
                  >
                    <Bot className="mr-1 h-3 w-3" />
                    Enrich
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contract Details */}
        <div className="space-y-6">
          {isEnriching && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-600" />
                  AI Enrichment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900 mx-auto mb-4"></div>
                    <p className="text-sm text-slate-600">Analyzing contract with AI agents...</p>
                  </div>
                  <Progress value={enrichmentProgress} />
                  <p className="text-center text-sm text-slate-500">{enrichmentProgress}% Complete</p>
                </div>
              </CardContent>
            </Card>
          )}

          {selectedContract && (
            <Card>
              <CardHeader>
                <CardTitle>{selectedContract.info.title}</CardTitle>
                <CardDescription>Contract Details & Enrichments</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="quality">Quality</TabsTrigger>
                    <TabsTrigger value="pricing">Pricing</TabsTrigger>
                    <TabsTrigger value="sla">SLA</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Basic Information</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-slate-600">Version:</span> {selectedContract.info.version}
                        </div>
                        <div>
                          <span className="text-slate-600">Owner:</span> {selectedContract.info.owner}
                        </div>
                        {selectedContract.info.contact && (
                          <div>
                            <span className="text-slate-600">Contact:</span> {selectedContract.info.contact.email}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Data Models</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedContract.models).map(([name, model]) => (
                          <div key={name} className="bg-slate-50 p-3 rounded">
                            <div className="font-medium">{name}</div>
                            <div className="text-sm text-slate-600">{model.description}</div>
                            <div className="text-xs text-slate-500 mt-1">{Object.keys(model.fields).length} fields</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="quality" className="space-y-4">
                    {selectedContract.quality ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-semibold">Quality Score: {getQualityScore(selectedContract)}%</span>
                        </div>

                        {selectedContract.quality.completeness && (
                          <div>
                            <h4 className="font-semibold mb-2">Completeness Rules</h4>
                            {selectedContract.quality.completeness.map((rule, index) => (
                              <div key={index} className="bg-slate-50 p-3 rounded mb-2">
                                <div className="font-medium text-sm">{rule.description}</div>
                                <div className="text-xs text-slate-600">
                                  Threshold: {(rule.threshold || 0) * 100}% | Severity: {rule.severity}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No quality metrics available. Run AI enrichment to analyze data quality.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    {selectedContract.pricing ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-green-600" />
                          <span className="font-semibold">Pricing Model: {selectedContract.pricing.model}</span>
                        </div>

                        {selectedContract.pricing.tiers && (
                          <div>
                            <h4 className="font-semibold mb-2">Pricing Tiers</h4>
                            {selectedContract.pricing.tiers.map((tier, index) => (
                              <div key={index} className="bg-slate-50 p-3 rounded mb-2">
                                <div className="font-medium">{tier.name}</div>
                                <div className="text-sm text-slate-600">
                                  ${tier.price} for up to {tier.limit} {selectedContract.pricing?.unit}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No pricing information available. Run AI enrichment to estimate costs.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  <TabsContent value="sla" className="space-y-4">
                    {selectedContract.serviceLevel ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">Service Level Agreement</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {selectedContract.serviceLevel.availability && (
                            <div>
                              <span className="text-slate-600">Availability:</span>
                              <div className="font-medium">
                                {selectedContract.serviceLevel.availability.percentage}%
                              </div>
                            </div>
                          )}
                          {selectedContract.serviceLevel.latency && (
                            <div>
                              <span className="text-slate-600">Latency:</span>
                              <div className="font-medium">{selectedContract.serviceLevel.latency.threshold}</div>
                            </div>
                          )}
                          {selectedContract.serviceLevel.freshness && (
                            <div>
                              <span className="text-slate-600">Freshness:</span>
                              <div className="font-medium">{selectedContract.serviceLevel.freshness.threshold}</div>
                            </div>
                          )}
                          {selectedContract.serviceLevel.support && (
                            <div>
                              <span className="text-slate-600">Support:</span>
                              <div className="font-medium">{selectedContract.serviceLevel.support.responseTime}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          No SLA information available. Run AI enrichment to define service levels.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
