import { type NextRequest, NextResponse } from "next/server"
import { MappingProjectRepository } from "@/lib/repositories/mapping-project-repository"

const projectRepo = new MappingProjectRepository()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined
    const createdBy = searchParams.get("createdBy") || undefined
    const search = searchParams.get("search") || undefined

    const projects = await projectRepo.findAll({ status, createdBy, search })

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
    })
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, sourceContractId, targetContractId, createdBy } = body

    if (!name || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: "Project name and createdBy are required",
        },
        { status: 400 },
      )
    }

    const projectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const newProject = await projectRepo.create({
      id: projectId,
      name,
      description: description || null,
      source_contract_id: sourceContractId || null,
      target_contract_id: targetContractId || null,
      created_by: createdBy,
      status: "draft",
    })

    return NextResponse.json(
      {
        success: true,
        data: newProject,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
