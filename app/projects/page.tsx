"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreVertical, Edit, Trash2, Play, FileText, Calendar, Target } from "lucide-react"
import Link from "next/link"

interface Project {
  id: string
  name: string
  description: string
  mappingCount: number
  avgConfidence: number
  lastModified: string
  status: "active" | "draft" | "archived"
  createdBy: string
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Customer Data Migration",
    description:
      "Maps customer data from legacy CRM to new system with comprehensive field validation and transformation rules.",
    mappingCount: 15,
    avgConfidence: 92,
    lastModified: "2024-01-15T10:30:00Z",
    status: "active",
    createdBy: "John Smith",
  },
  {
    id: "2",
    name: "Payroll Integration",
    description:
      "Employee payroll data transformation for SAP integration including salary, benefits, and tax calculations.",
    mappingCount: 23,
    avgConfidence: 88,
    lastModified: "2024-01-12T14:20:00Z",
    status: "active",
    createdBy: "Sarah Johnson",
  },
  {
    id: "3",
    name: "Product Catalog Sync",
    description: "Product information synchronization between e-commerce platform and inventory management system.",
    mappingCount: 18,
    avgConfidence: 95,
    lastModified: "2024-01-10T09:15:00Z",
    status: "active",
    createdBy: "Mike Chen",
  },
  {
    id: "4",
    name: "Financial Reporting",
    description: "Transform financial data for regulatory reporting compliance with automated validation checks.",
    mappingCount: 31,
    avgConfidence: 85,
    lastModified: "2024-01-08T16:45:00Z",
    status: "draft",
    createdBy: "Lisa Anderson",
  },
  {
    id: "5",
    name: "Legacy System Migration",
    description: "Complete data migration from legacy mainframe system to modern cloud-based solution.",
    mappingCount: 42,
    avgConfidence: 78,
    lastModified: "2024-01-05T11:30:00Z",
    status: "archived",
    createdBy: "David Wilson",
  },
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(mockProjects)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft" | "archived">("all")

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.createdBy.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || project.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case "draft":
        return <Badge className="bg-yellow-100 text-yellow-800">Draft</Badge>
      case "archived":
        return <Badge variant="secondary">Archived</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "text-green-600"
    if (confidence >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Mapping Projects</h1>
            <p className="text-slate-600">
              Manage your data mapping configurations and reuse them across transformations
            </p>
          </div>
          <Button asChild className="bg-blue-900 hover:bg-blue-800">
            <Link href="/data-mapping">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          {(["all", "active", "draft", "archived"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className="capitalize"
            >
              {status}
              {status !== "all" && (
                <Badge variant="secondary" className="ml-2">
                  {projects.filter((p) => p.status === status).length}
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusBadge(project.status)}
                    <Badge variant="outline" className="text-xs">
                      {project.mappingCount} mappings
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Project
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Play className="mr-2 h-4 w-4" />
                      Use for Transform
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Project
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <CardDescription className="text-sm line-clamp-3">{project.description}</CardDescription>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Avg. Confidence</span>
                  <span className={`font-medium ${getConfidenceColor(project.avgConfidence)}`}>
                    {project.avgConfidence}%
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  <span>Modified {formatDate(project.lastModified)}</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Target className="h-3 w-3" />
                  <span>Created by {project.createdBy}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" className="flex-1" asChild>
                  <Link href={`/transform?project=${project.id}`}>
                    <Play className="mr-2 h-3 w-3" />
                    Transform
                  </Link>
                </Button>
                <Button size="sm" variant="outline" className="flex-1">
                  <FileText className="mr-2 h-3 w-3" />
                  View Details
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
            <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No projects found</h3>
            <p className="text-slate-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Create your first mapping project to get started"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Button asChild className="bg-blue-900 hover:bg-blue-800">
                <Link href="/data-mapping">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Project
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">{projects.length}</div>
            <div className="text-sm text-slate-600">Total Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {projects.filter((p) => p.status === "active").length}
            </div>
            <div className="text-sm text-slate-600">Active Projects</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(projects.reduce((acc, p) => acc + p.mappingCount, 0) / projects.length)}
            </div>
            <div className="text-sm text-slate-600">Avg. Mappings</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-slate-900">
              {Math.round(projects.reduce((acc, p) => acc + p.avgConfidence, 0) / projects.length)}%
            </div>
            <div className="text-sm text-slate-600">Avg. Confidence</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
