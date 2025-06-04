import { type NextRequest, NextResponse } from "next/server"
import { DataContractRepository } from "@/lib/repositories/data-contract-repository"

const contractRepo = new DataContractRepository()

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contract = await contractRepo.findById(params.id)

    if (!contract) {
      return NextResponse.json({ success: false, error: "Contract not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: contract,
    })
  } catch (error) {
    console.error("Error fetching contract:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { contract } = body

    const updatedContract = await contractRepo.update(params.id, contract)

    if (!updatedContract) {
      return NextResponse.json({ success: false, error: "Contract not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: updatedContract,
    })
  } catch (error) {
    console.error("Error updating contract:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const deleted = await contractRepo.delete(params.id)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Contract not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Contract deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting contract:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
