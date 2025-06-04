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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Plus, Search, Edit, Eye, Download, CheckCircle, Info } from "lucide-react"

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
}

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedContract, setSelectedContract] = useState<DataContract | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const contracts: DataContract[] = [
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
  ]

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contract Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{selectedContract.title}</h3>
                  <p className="text-sm text-slate-600 mb-2">Version {selectedContract.version}</p>
                  {getStatusBadge(selectedContract.status)}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Description</Label>
                    <p className="text-sm text-slate-600">{selectedContract.description}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Owner</Label>
                    <p className="text-sm text-slate-600">{selectedContract.owner}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Last Modified</Label>
                    <p className="text-sm text-slate-600">{selectedContract.lastModified}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Fields</Label>
                      <p className="text-sm text-slate-600">{selectedContract.fieldCount}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Usage</Label>
                      <p className="text-sm text-slate-600">{selectedContract.usageCount} projects</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <Tabs defaultValue="schema" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="schema">Schema</TabsTrigger>
                    <TabsTrigger value="quality">Quality</TabsTrigger>
                    <TabsTrigger value="usage">Usage</TabsTrigger>
                  </TabsList>

                  <TabsContent value="schema" className="mt-4">
                    <ScrollArea className="h-48 w-full rounded border p-3">
                      <pre className="text-xs">
                        {`{
  "customer": {
    "type": "table",
    "fields": {
      "id": {
        "type": "integer",
        "required": true
      },
      "email": {
        "type": "string",
        "format": "email",
        "required": true
      },
      "name": {
        "type": "string",
        "required": true
      }
    }
  }
}`}
                      </pre>
                    </ScrollArea>
                  </TabsContent>

                  <TabsContent value="quality" className="mt-4">
                    <div className="space-y-2">
                      <Alert>
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>Data quality score: 95%</AlertDescription>
                      </Alert>
                      <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>Last validation: 2 hours ago</AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>

                  <TabsContent value="usage" className="mt-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Customer Migration</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Data Sync Project</span>
                        <Badge variant="outline">Active</Badge>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex gap-2 pt-4">
                  <Button size="sm" className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
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
    </div>
  )
}
