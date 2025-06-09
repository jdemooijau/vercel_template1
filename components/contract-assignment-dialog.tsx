"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Plus, RefreshCw, CheckCircle, AlertTriangle } from "lucide-react"

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

interface ContractAssignmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  generatedContract: GeneratedContract | null
  existingContracts: DataContract[]
  onAssign: (type: "new" | "existing", data: any) => void
}

export function ContractAssignmentDialog({
  open,
  onOpenChange,
  generatedContract,
  existingContracts,
  onAssign,
}: ContractAssignmentDialogProps) {
  const [assignmentType, setAssignmentType] = useState<"new" | "existing">("new")
  const [selectedContractId, setSelectedContractId] = useState("")
  const [newContractData, setNewContractData] = useState({
    id: "",
    title: "",
    version: "1.0.0",
    description: "",
    owner: "Data Team",
  })
  const [versionStrategy, setVersionStrategy] = useState<"replace" | "increment">("increment")
  const [newVersion, setNewVersion] = useState("")

  if (!generatedContract) return null

  // Auto-populate new contract data from generated contract
  const autoPopulateFromGenerated = () => {
    const fileName = generatedContract.metadata.fileName.split(".")[0]
    const contractId = fileName.toLowerCase().replace(/[^a-z0-9]/g, "-") + "-contract"

    setNewContractData({
      id: contractId,
      title: `${fileName} Data Contract`,
      version: "1.0.0",
      description: `Auto-generated contract from ${generatedContract.metadata.fileType.toUpperCase()} file`,
      owner: "Data Team",
    })
  }

  const handleAssign = () => {
    if (assignmentType === "new") {
      if (!newContractData.id || !newContractData.title) {
        return // Validation would go here
      }
      onAssign("new", newContractData)
    } else {
      if (!selectedContractId) {
        return // Validation would go here
      }
      onAssign("existing", {
        contractId: selectedContractId,
        versionStrategy,
        newVersion: versionStrategy === "increment" ? newVersion : undefined,
      })
    }
  }

  const getSelectedContract = () => {
    return existingContracts.find((c) => c.id === selectedContractId)
  }

  const generateNextVersion = (currentVersion: string) => {
    const parts = currentVersion.split(".")
    const major = Number.parseInt(parts[0] || "1")
    const minor = Number.parseInt(parts[1] || "0")
    const patch = Number.parseInt(parts[2] || "0")
    return `${major}.${minor}.${patch + 1}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Generated Contract</DialogTitle>
          <DialogDescription>Choose how to assign the generated YAML contract to your data contracts</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Generated Contract Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Generated Contract Summary
              </CardTitle>
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

              {generatedContract.metadata.warnings && generatedContract.metadata.warnings.length > 0 && (
                <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <div className="font-medium mb-1">Warnings to consider:</div>
                    <ul className="text-sm space-y-1">
                      {generatedContract.metadata.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Assignment Type Selection */}
          <div>
            <Label className="text-sm font-medium mb-3 block">Assignment Type</Label>
            <RadioGroup
              value={assignmentType}
              onValueChange={(value) => setAssignmentType(value as "new" | "existing")}
            >
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="new" id="new" />
                  <Label htmlFor="new" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Create New Data Contract
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Create a brand new data contract with the generated YAML
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Update Existing Contract
                    </div>
                    <p className="text-sm text-slate-600 mt-1">
                      Replace or update an existing data contract with the generated YAML
                    </p>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* New Contract Form */}
          {assignmentType === "new" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">New Contract Details</Label>
                <Button variant="outline" size="sm" onClick={autoPopulateFromGenerated}>
                  Auto-populate
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contract-id">Contract ID</Label>
                  <Input
                    id="contract-id"
                    value={newContractData.id}
                    onChange={(e) => setNewContractData({ ...newContractData, id: e.target.value })}
                    placeholder="e.g., customer-data-contract"
                  />
                </div>
                <div>
                  <Label htmlFor="contract-version">Version</Label>
                  <Input
                    id="contract-version"
                    value={newContractData.version}
                    onChange={(e) => setNewContractData({ ...newContractData, version: e.target.value })}
                    placeholder="1.0.0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="contract-title">Title</Label>
                <Input
                  id="contract-title"
                  value={newContractData.title}
                  onChange={(e) => setNewContractData({ ...newContractData, title: e.target.value })}
                  placeholder="e.g., Customer Data Contract"
                />
              </div>

              <div>
                <Label htmlFor="contract-description">Description</Label>
                <Textarea
                  id="contract-description"
                  value={newContractData.description}
                  onChange={(e) => setNewContractData({ ...newContractData, description: e.target.value })}
                  placeholder="Describe the purpose and scope of this data contract"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="contract-owner">Owner</Label>
                <Input
                  id="contract-owner"
                  value={newContractData.owner}
                  onChange={(e) => setNewContractData({ ...newContractData, owner: e.target.value })}
                  placeholder="Team or individual responsible"
                />
              </div>
            </div>
          )}

          {/* Existing Contract Selection */}
          {assignmentType === "existing" && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-3 block">Select Existing Contract</Label>
                <Select value={selectedContractId} onValueChange={setSelectedContractId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a contract to update" />
                  </SelectTrigger>
                  <SelectContent>
                    {existingContracts.map((contract) => (
                      <SelectItem key={contract.id} value={contract.id}>
                        <div className="flex items-center gap-2">
                          <span>{contract.title}</span>
                          <Badge variant="outline" className="text-xs">
                            v{contract.version}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              contract.status === "active"
                                ? "text-green-700"
                                : contract.status === "draft"
                                  ? "text-yellow-700"
                                  : "text-gray-700"
                            }`}
                          >
                            {contract.status}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedContractId && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Selected Contract</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const contract = getSelectedContract()
                        if (!contract) return null
                        return (
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label className="text-xs text-slate-600">Title</Label>
                                <p className="font-medium">{contract.title}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-600">Current Version</Label>
                                <p className="font-medium">v{contract.version}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-600">Owner</Label>
                                <p className="font-medium">{contract.owner}</p>
                              </div>
                              <div>
                                <Label className="text-xs text-slate-600">Status</Label>
                                <Badge variant="outline" className="text-xs">
                                  {contract.status}
                                </Badge>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs text-slate-600">Description</Label>
                              <p className="text-sm">{contract.description}</p>
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  <div>
                    <Label className="text-sm font-medium mb-3 block">Version Strategy</Label>
                    <RadioGroup
                      value={versionStrategy}
                      onValueChange={(value) => setVersionStrategy(value as "replace" | "increment")}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="replace" id="replace" />
                          <Label htmlFor="replace" className="flex-1 cursor-pointer">
                            <div>Replace Current Version</div>
                            <p className="text-sm text-slate-600">
                              Overwrite the existing contract with the generated YAML (same version)
                            </p>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="increment" id="increment" />
                          <Label htmlFor="increment" className="flex-1 cursor-pointer">
                            <div>Create New Version</div>
                            <p className="text-sm text-slate-600">
                              Create a new version of the contract with the generated YAML
                            </p>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>

                    {versionStrategy === "increment" && (
                      <div className="mt-4">
                        <Label htmlFor="new-version">New Version</Label>
                        <Input
                          id="new-version"
                          value={newVersion}
                          onChange={(e) => setNewVersion(e.target.value)}
                          placeholder={(() => {
                            const contract = getSelectedContract()
                            return contract ? generateNextVersion(contract.version) : "1.0.1"
                          })()}
                        />
                        <p className="text-xs text-slate-600 mt-1">
                          Suggested: {(() => {
                            const contract = getSelectedContract()
                            return contract ? generateNextVersion(contract.version) : "1.0.1"
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* YAML Preview */}
          <div>
            <Label className="text-sm font-medium mb-2 block">Generated YAML Preview</Label>
            <ScrollArea className="h-48 w-full rounded border p-3 bg-slate-50">
              <pre className="text-xs whitespace-pre-wrap font-mono">{generatedContract.yaml}</pre>
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={
                assignmentType === "new"
                  ? !newContractData.id || !newContractData.title
                  : !selectedContractId || (versionStrategy === "increment" && !newVersion)
              }
              className="flex-1"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {assignmentType === "new" ? "Create Contract" : "Update Contract"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
