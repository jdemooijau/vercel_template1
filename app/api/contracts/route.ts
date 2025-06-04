import { type NextRequest, NextResponse } from "next/server"
import { DataContractRepository } from "@/lib/repositories/data-contract-repository"
import type { DataContract } from "@/types/data-contract"

const contractRepo = new DataContractRepository()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || undefined
    const owner = searchParams.get("owner") || undefined
    const search = searchParams.get("search") || undefined

    const contracts = await contractRepo.findAll({ status, owner, search })

    return NextResponse.json({
      success: true,
      data: contracts,
      count: contracts.length,
    })
  } catch (error) {
    console.error("Error fetching contracts:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch contracts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contract, createdBy } = body

    if (!contract || !createdBy) {
      return NextResponse.json(
        {
          success: false,
          error: "Contract data and createdBy are required",
        },
        { status: 400 },
      )
    }

    // Generate ID if not provided
    if (!contract.id) {
      contract.id = `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }

    const newContract = await contractRepo.create(contract as DataContract, createdBy)

    return NextResponse.json(
      {
        success: true,
        data: newContract,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating contract:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create contract",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
