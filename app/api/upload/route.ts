import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/database"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const projectId = formData.get("projectId") as string
    const fileType = formData.get("fileType") as string

    if (!file || !projectId || !fileType) {
      return NextResponse.json(
        {
          success: false,
          error: "File, projectId, and fileType are required",
        },
        { status: 400 },
      )
    }

    // Validate file type
    const allowedTypes = ["source_document", "target_document", "source_sample", "target_sample"]
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json({ success: false, error: "Invalid file type" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = file.name.split(".").pop()
    const filename = `${projectId}/${fileType}_${timestamp}.${fileExtension}`

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("project-files")
      .upload(filename, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      throw uploadError
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("project-files").getPublicUrl(filename)

    // Create file record
    const fileRecord = {
      id: `file-${timestamp}-${Math.random().toString(36).substr(2, 9)}`,
      projectId,
      filename: uploadData.path,
      originalFilename: file.name,
      fileType,
      mimeType: file.type,
      fileSize: file.size,
      filePath: publicUrl,
      uploadStatus: "completed",
      uploadedAt: new Date().toISOString(),
    }

    // TODO: Save file record to database
    // await fileUploadRepo.create(fileRecord)

    return NextResponse.json({
      success: true,
      data: fileRecord,
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to upload file",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
