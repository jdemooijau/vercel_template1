import { type NextRequest, NextResponse } from "next/server"
import { AIService } from "@/lib/services/ai-service"
import { DataContractRepository } from "@/lib/repositories/data-contract-repository"
import { MappingProjectRepository } from "@/lib/repositories/mapping-project-repository"

const aiService = new AIService()
const contractRepo = new DataContractRepository()
const projectRepo = new MappingProjectRepository()

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { sourceDocument, targetDocument, sourceSample, targetSample } = body

    // Get project details
    const project = await projectRepo.findById(params.id)
    if (!project) {
      return NextResponse.json({ success: false, error: "Project not found" }, { status: 404 })
    }

    // Get contracts if specified
    let sourceContract, targetContract
    if (project.source_contract_id) {
      sourceContract = await contractRepo.findById(project.source_contract_id)
    }
    if (project.target_contract_id) {
      targetContract = await contractRepo.findById(project.target_contract_id)
    }

    // Analyze with Grok AI
    const analysis = await aiService.analyzeMappingRequirements(
      sourceContract || undefined,
      targetContract || undefined,
      sourceDocument,
      targetDocument,
      sourceSample,
      targetSample,
    )

    // Update project status
    await projectRepo.update(params.id, {
      status: "in_progress",
      metadata: {
        lastAnalysis: new Date().toISOString(),
        analysisResults: {
          confidence: analysis.confidence,
          mappingCount: analysis.mappings.length,
          suggestions: analysis.suggestions,
          warnings: analysis.warnings,
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    console.error("Error analyzing project:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to analyze project",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
