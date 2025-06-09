"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Search, Upload, Download, Trash2, Plus, Database } from "lucide-react"

type FileRecord = {
  reqid: string
  filename: string
  fileType: "in" | "out"
  appName: string
  sftpUser: string
  countryCode: string
  customerId: string
  fileSize: string
  status: "pending" | "processing" | "completed" | "failed"
  createdAt: string
}

export default function DataQueuePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterApp, setFilterApp] = useState("all")
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const files: FileRecord[] = [
    {
      reqid: "req-001",
      filename: "customer_data.csv",
      fileType: "in",
      appName: "PEXI_IN",
      sftpUser: "user1",
      countryCode: "US",
      customerId: "CUST001",
      fileSize: "2.1 MB",
      status: "completed",
      createdAt: "2024-01-15",
    },
    {
      reqid: "req-002",
      filename: "product_export.xml",
      fileType: "out",
      appName: "G2_OUT",
      sftpUser: "user2",
      countryCode: "GB",
      customerId: "CUST002",
      fileSize: "1.5 MB",
      status: "pending",
      createdAt: "2024-01-14",
    },
    {
      reqid: "req-003",
      filename: "financial_report.xlsx",
      fileType: "in",
      appName: "SAP_EXPORT",
      sftpUser: "user1",
      countryCode: "DE",
      customerId: "CUST003",
      fileSize: "5.2 MB",
      status: "processing",
      createdAt: "2024-01-13",
    },
    {
      reqid: "req-004",
      filename: "inventory_sync.json",
      fileType: "out",
      appName: "PEXI_OUT",
      sftpUser: "user3",
      countryCode: "FR",
      customerId: "CUST001",
      fileSize: "3.8 MB",
      status: "failed",
      createdAt: "2024-01-12",
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">✅ Completed</Badge>
      case "processing":
        return <Badge className="bg-blue-100 text-blue-800">⏳ Processing</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pending</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">❌ Failed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getFileTypeBadge = (type: string) => {
    return type === "in" ? (
      <Badge variant="outline" className="bg-blue-50 text-blue-700">
        IN
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-green-50 text-green-700">
        OUT
      </Badge>
    )
  }

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.customerId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || file.fileType === filterType
    const matchesStatus = filterStatus === "all" || file.status === filterStatus
    const matchesApp = filterApp === "all" || file.appName === filterApp

    return matchesSearch && matchesType && matchesStatus && matchesApp
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Data Queue</h1>
        <p className="text-slate-600">Manage your file queue with comprehensive metadata tracking</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                File Management
              </CardTitle>
              <CardDescription>Search, filter, and manage your data files</CardDescription>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-900 hover:bg-blue-800">
                  <Plus className="mr-2 h-4 w-4" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Upload File to Data Queue</DialogTitle>
                  <DialogDescription>Add a new file to the data queue with metadata</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="file">File</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm text-slate-600">Click to select file</p>
                    </div>
                  </div>

                  <div>
                    <Label>File Type</Label>
                    <RadioGroup defaultValue="in" className="flex gap-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="in" id="incoming" />
                        <Label htmlFor="incoming">Incoming</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="out" id="outgoing" />
                        <Label htmlFor="outgoing">Outgoing</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="app-name">App Name</Label>
                      <Input id="app-name" placeholder="e.g., PEXI_IN" />
                    </div>
                    <div>
                      <Label htmlFor="sftp-user">SFTP User</Label>
                      <Input id="sftp-user" placeholder="Username" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ident1">Ident1</Label>
                      <Input id="ident1" placeholder="Optional" />
                    </div>
                    <div>
                      <Label htmlFor="ident2">Ident2</Label>
                      <Input id="ident2" placeholder="Optional" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" placeholder="US" maxLength={2} />
                    </div>
                    <div>
                      <Label htmlFor="customer">Customer ID</Label>
                      <Input id="customer" placeholder="CUST001" />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsUploadOpen(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={() => setIsUploadOpen(false)}>
                      Upload File
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search files or customer ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in">Incoming</SelectItem>
                  <SelectItem value="out">Outgoing</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterApp} onValueChange={setFilterApp}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="App" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Apps</SelectItem>
                  <SelectItem value="PEXI_IN">PEXI_IN</SelectItem>
                  <SelectItem value="G2_OUT">G2_OUT</SelectItem>
                  <SelectItem value="SAP_EXPORT">SAP_EXPORT</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>App</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFiles.map((file) => (
                <TableRow key={file.reqid}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{file.filename}</div>
                      <div className="text-sm text-slate-500">{file.fileSize}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getFileTypeBadge(file.fileType)}</TableCell>
                  <TableCell className="font-mono text-sm">{file.appName}</TableCell>
                  <TableCell>{file.sftpUser}</TableCell>
                  <TableCell>{file.countryCode}</TableCell>
                  <TableCell className="font-mono text-sm">{file.customerId}</TableCell>
                  <TableCell>{getStatusBadge(file.status)}</TableCell>
                  <TableCell>{file.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-slate-600">
          Showing {filteredFiles.length} of {files.length} files
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Previous
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
