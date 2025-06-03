"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import {
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  Plus,
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
} from "lucide-react"

interface LDQFile {
  reqid: string
  file_type: "in" | "out"
  app_name: string
  sftp_user: string
  filename: string
  ident1?: string
  ident2?: string
  country_code: string
  customer_id: string
  file_size: number
  status: "pending" | "processing" | "completed" | "failed"
  created_at: string
  error_message?: string
}

const mockFiles: LDQFile[] = [
  {
    reqid: "1",
    file_type: "in",
    app_name: "PEXI_IN",
    sftp_user: "user1",
    filename: "customer_data.csv",
    ident1: "BATCH001",
    ident2: "IMPORT",
    country_code: "US",
    customer_id: "CUST001",
    file_size: 2097152,
    status: "completed",
    created_at: "2024-01-15T10:30:00Z",
  },
  {
    reqid: "2",
    file_type: "out",
    app_name: "G2_OUT",
    sftp_user: "user2",
    filename: "export_data.xml",
    ident1: "EXP001",
    country_code: "GB",
    customer_id: "CUST002",
    file_size: 1572864,
    status: "pending",
    created_at: "2024-01-14T15:45:00Z",
  },
  {
    reqid: "3",
    file_type: "in",
    app_name: "SAP_IMPORT",
    sftp_user: "user3",
    filename: "payroll_data.xlsx",
    ident1: "PAY001",
    ident2: "MONTHLY",
    country_code: "DE",
    customer_id: "CUST003",
    file_size: 5242880,
    status: "processing",
    created_at: "2024-01-13T09:15:00Z",
  },
  {
    reqid: "4",
    file_type: "out",
    app_name: "PEXI_OUT",
    sftp_user: "user1",
    filename: "failed_records.csv",
    country_code: "US",
    customer_id: "CUST001",
    file_size: 1048576,
    status: "failed",
    created_at: "2024-01-12T14:20:00Z",
    error_message: "Invalid data format in row 45",
  },
]

export default function LDQPage() {
  const [files, setFiles] = useState<LDQFile[]>(mockFiles)
  const [filteredFiles, setFilteredFiles] = useState<LDQFile[]>(mockFiles)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    type: "all",
    app: "all",
    user: "all",
    country: "all",
    customer: "all",
    status: "all",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Apply filters and search
  useEffect(() => {
    let filtered = files

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(
        (file) =>
          file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.app_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          file.customer_id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply filters
    if (filters.type !== "all") {
      filtered = filtered.filter((file) => file.file_type === filters.type)
    }
    if (filters.app !== "all") {
      filtered = filtered.filter((file) => file.app_name === filters.app)
    }
    if (filters.user !== "all") {
      filtered = filtered.filter((file) => file.sftp_user === filters.user)
    }
    if (filters.country !== "all") {
      filtered = filtered.filter((file) => file.country_code === filters.country)
    }
    if (filters.customer !== "all") {
      filtered = filtered.filter((file) => file.customer_id === filters.customer)
    }
    if (filters.status !== "all") {
      filtered = filtered.filter((file) => file.status === filters.status)
    }

    setFilteredFiles(filtered)
    setCurrentPage(1)
  }, [files, searchTerm, filters])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "processing":
        return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const clearFilters = () => {
    setFilters({
      type: "all",
      app: "all",
      user: "all",
      country: "all",
      customer: "all",
      status: "all",
    })
    setSearchTerm("")
  }

  const paginatedFiles = filteredFiles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const totalPages = Math.ceil(filteredFiles.length / itemsPerPage)

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Local Data Queue (LDQ)</h1>
        <p className="text-slate-600">Manage and monitor your data files with comprehensive metadata tracking</p>
      </div>

      {/* Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search files, apps, or customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {Object.values(filters).some((f) => f !== "all") && (
                <Badge variant="secondary" className="ml-1">
                  {Object.values(filters).filter((f) => f !== "all").length}
                </Badge>
              )}
            </Button>
          </div>

          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-900 hover:bg-blue-800">
                <Plus className="mr-2 h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Upload File to LDQ</DialogTitle>
                <DialogDescription>Add a new file to the Local Data Queue with metadata</DialogDescription>
              </DialogHeader>
              <UploadForm onClose={() => setUploadDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Filters</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="in">Incoming</SelectItem>
                      <SelectItem value="out">Outgoing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">App</Label>
                  <Select
                    value={filters.app}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, app: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="PEXI_IN">PEXI_IN</SelectItem>
                      <SelectItem value="G2_OUT">G2_OUT</SelectItem>
                      <SelectItem value="SAP_IMPORT">SAP_IMPORT</SelectItem>
                      <SelectItem value="PEXI_OUT">PEXI_OUT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">User</Label>
                  <Select
                    value={filters.user}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, user: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="user1">user1</SelectItem>
                      <SelectItem value="user2">user2</SelectItem>
                      <SelectItem value="user3">user3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Country</Label>
                  <Select
                    value={filters.country}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="US">US</SelectItem>
                      <SelectItem value="GB">GB</SelectItem>
                      <SelectItem value="DE">DE</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Customer</Label>
                  <Select
                    value={filters.customer}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, customer: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="CUST001">CUST001</SelectItem>
                      <SelectItem value="CUST002">CUST002</SelectItem>
                      <SelectItem value="CUST003">CUST003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Files Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Files</CardTitle>
              <CardDescription>
                Showing {paginatedFiles.length} of {filteredFiles.length} files
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedFiles.map((file) => (
                  <TableRow key={file.reqid}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-slate-400" />
                        <div>
                          <div className="font-medium text-sm">{file.filename}</div>
                          <div className="text-xs text-slate-500">{formatFileSize(file.file_size)}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={file.file_type === "in" ? "default" : "secondary"}>
                        {file.file_type.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{file.app_name}</TableCell>
                    <TableCell className="text-sm">{file.sftp_user}</TableCell>
                    <TableCell className="font-mono text-sm">{file.country_code}</TableCell>
                    <TableCell className="font-mono text-sm">{file.customer_id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(file.status)}
                        {getStatusBadge(file.status)}
                      </div>
                      {file.error_message && (
                        <div className="text-xs text-red-600 mt-1" title={file.error_message}>
                          {file.error_message.length > 30
                            ? `${file.error_message.substring(0, 30)}...`
                            : file.error_message}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(file.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <Button size="sm" variant="ghost" title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <div className="text-sm text-slate-600">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, filteredFiles.length)} of {filteredFiles.length} files
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                {totalPages > 5 && <span className="text-slate-400">...</span>}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function UploadForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    file: null as File | null,
    fileType: "in",
    appName: "",
    sftpUser: "",
    ident1: "",
    ident2: "",
    countryCode: "",
    customerId: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="file">File *</Label>
        <Input
          id="file"
          type="file"
          onChange={(e) => setFormData((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
          className="mt-1"
          required
        />
      </div>

      <div>
        <Label>File Type *</Label>
        <RadioGroup
          value={formData.fileType}
          onValueChange={(value) => setFormData((prev) => ({ ...prev, fileType: value }))}
          className="flex gap-6 mt-2"
        >
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
          <Label htmlFor="appName">App Name *</Label>
          <Input
            id="appName"
            value={formData.appName}
            onChange={(e) => setFormData((prev) => ({ ...prev, appName: e.target.value }))}
            placeholder="e.g., PEXI_IN"
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="sftpUser">SFTP User *</Label>
          <Input
            id="sftpUser"
            value={formData.sftpUser}
            onChange={(e) => setFormData((prev) => ({ ...prev, sftpUser: e.target.value }))}
            placeholder="e.g., user1"
            className="mt-1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="ident1">Ident1</Label>
          <Input
            id="ident1"
            value={formData.ident1}
            onChange={(e) => setFormData((prev) => ({ ...prev, ident1: e.target.value }))}
            placeholder="Optional identifier"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="ident2">Ident2</Label>
          <Input
            id="ident2"
            value={formData.ident2}
            onChange={(e) => setFormData((prev) => ({ ...prev, ident2: e.target.value }))}
            placeholder="Optional identifier"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="countryCode">Country Code *</Label>
          <Input
            id="countryCode"
            value={formData.countryCode}
            onChange={(e) => setFormData((prev) => ({ ...prev, countryCode: e.target.value.toUpperCase() }))}
            placeholder="e.g., US"
            maxLength={2}
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="customerId">Customer ID *</Label>
          <Input
            id="customerId"
            value={formData.customerId}
            onChange={(e) => setFormData((prev) => ({ ...prev, customerId: e.target.value }))}
            placeholder="e.g., CUST001"
            className="mt-1"
            required
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-900 hover:bg-blue-800">
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </div>
    </form>
  )
}
