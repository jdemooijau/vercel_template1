"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, FileIcon as FileTransfer, Edit, Trash2, FolderOpen, Calendar, Target } from "lucide-react"

type Project = {
  id: string
  name: string
  description: string
  status: "active" | "draft" | "archived"
  mappingCount: number
  confidence: number
  lastModified: string
  createdBy: string
  transformations: number
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const projects: Project[] = [
    {
      id: "1",
      name: "Customer Data Migration",
      description: "Maps customer data from legacy CRM to new system with comprehensive field validation",
      status: "active",
      mappingCount: 15,
      confidence: 92,
      lastModified: "2024-01-15",
      createdBy: "John Smith",
      transformations: 23,
    },
    {
      id: "2",
      name: "Product Catalog Sync",
      description: "Synchronizes product information between e-commerce platform and inventory system",
      status: "active",
      mappingCount: 23,
      confidence: 88,
      lastModified: "2024-01-12",
      createdBy: "Sarah Johnson",
      transformations: 45,
    },
    {
      id: "3",
      name: "Financial Data Export",
      description: "Exports financial records for quarterly reporting and compliance requirements",
      status: "draft",
      mappingCount: 31,
      confidence: 95,
      lastModified: "2024-01-10",
      createdBy: "Mike Wilson",
      transformations: 12,
    },
    {
      id: "4",
      name: "HR Employee Sync",
      description: "Synchronizes employee data between HR system and payroll platform",
      status: "active",
      mappingCount: 18,
      confidence: 89,
      lastModified: "2024-01-08",
      createdBy: "Lisa Chen",
      transformations: 67,
    },
    {
      id: "5",
      name: "Legacy System Migration",
      description: "Complete data migration from legacy mainframe to modern cloud infrastructure",
      status: "archived",
      mappingCount: 42,
      confidence: 91,
      lastModified: "2023-12-20",
      createdBy: "David Brown",
      transformations: 156,
    },
    {
      id: "6",
      name: "API Data Integration",
      description: "Real-time data integration between third-party APIs and internal systems",
      status: "draft",
      mappingCount: 8,
      confidence: 76,
      lastModified: "2024-01-05",
      createdBy: "Emma Davis",
      transformations: 3,
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case "archived":
        return <Badge className="bg-gray-100 text-gray-800">Archived</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === "all" || project.status === filterStatus

    return matchesSearch && matchesStatus
  })

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Project Management</h1>
        <p className="text-slate-600">Organize and manage your data mapping projects</p>
      </div>

      {/* Controls */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5" />
                Projects Overview
              </CardTitle>
              <CardDescription>Search and filter your mapping projects</CardDescription>
            </div>
            <Button className="bg-blue-900 hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{project.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(project.status)}
                    <Badge variant="outline" className="text-xs">
                      {project.mappingCount} mappings
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="text-sm line-clamp-2">{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Target className="h-3 w-3" />
                    Confidence
                  </div>
                  <div className={`font-semibold ${getConfidenceColor(project.confidence)}`}>{project.confidence}%</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 text-slate-600">
                    <FileTransfer className="h-3 w-3" />
                    Transforms
                  </div>
                  <div className="font-semibold">{project.transformations}</div>
                </div>
              </div>

              {/* Metadata */}
              <div className="text-xs text-slate-500 space-y-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Modified: {project.lastModified}
                </div>
                <div>Created by: {project.createdBy}</div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1">
                  <FileTransfer className="mr-1 h-3 w-3" />
                  Transform
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <FolderOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || filterStatus !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first mapping project to get started"}
            </p>
            <Button className="bg-blue-900 hover:bg-blue-800">
              <Plus className="mr-2 h-4 w-4" />
              Create New Project
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {filteredProjects.length > 0 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-slate-600">
            Showing {filteredProjects.length} of {projects.length} projects
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
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
