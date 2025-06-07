// Utility functions for processing different file types
export interface FileAnalysis {
  fileType: string
  size: number
  estimatedRecords?: number
  detectedFields?: Array<{
    name: string
    type: string
    nullable: boolean
    unique?: boolean
  }>
  encoding?: string
  delimiter?: string
  hasHeader?: boolean
}

export class FileProcessor {
  static async analyzeFile(file: File): Promise<FileAnalysis> {
    const fileType = this.getFileType(file.name)
    const analysis: FileAnalysis = {
      fileType,
      size: file.size,
    }

    try {
      switch (fileType) {
        case "csv":
          return await this.analyzeCsvFile(file, analysis)
        case "json":
          return await this.analyzeJsonFile(file, analysis)
        case "jsonl":
          return await this.analyzeJsonlFile(file, analysis)
        default:
          return analysis
      }
    } catch (error) {
      console.warn("File analysis failed:", error)
      return analysis
    }
  }

  private static getFileType(filename: string): string {
    const extension = filename.split(".").pop()?.toLowerCase()
    return extension || "unknown"
  }

  private static async analyzeCsvFile(file: File, analysis: FileAnalysis): Promise<FileAnalysis> {
    const text = await this.readFileAsText(file, 1024 * 10) // Read first 10KB
    const lines = text.split("\n").filter((line) => line.trim())

    if (lines.length === 0) return analysis

    // Detect delimiter
    const delimiters = [",", ";", "\t", "|"]
    let bestDelimiter = ","
    let maxColumns = 0

    for (const delimiter of delimiters) {
      const columns = lines[0].split(delimiter).length
      if (columns > maxColumns) {
        maxColumns = columns
        bestDelimiter = delimiter
      }
    }

    analysis.delimiter = bestDelimiter
    analysis.hasHeader = this.detectCsvHeader(lines[0], bestDelimiter)
    analysis.estimatedRecords = Math.floor(file.size / (text.length / lines.length))

    // Analyze field types from first few rows
    if (lines.length > 1) {
      const headerRow = lines[0].split(bestDelimiter)
      const dataRows = lines.slice(1, Math.min(6, lines.length))

      analysis.detectedFields = headerRow.map((header, index) => {
        const values = dataRows.map((row) => row.split(bestDelimiter)[index]).filter(Boolean)
        return {
          name: header.replace(/['"]/g, "").trim(),
          type: this.inferDataType(values),
          nullable: values.length < dataRows.length,
        }
      })
    }

    return analysis
  }

  private static async analyzeJsonFile(file: File, analysis: FileAnalysis): Promise<FileAnalysis> {
    const text = await this.readFileAsText(file, 1024 * 5) // Read first 5KB

    try {
      const json = JSON.parse(text)

      if (Array.isArray(json)) {
        analysis.estimatedRecords = json.length
        if (json.length > 0) {
          analysis.detectedFields = this.extractJsonFields(json[0])
        }
      } else {
        analysis.detectedFields = this.extractJsonFields(json)
        analysis.estimatedRecords = 1
      }
    } catch (error) {
      // Partial JSON, try to estimate
      const braceCount = (text.match(/{/g) || []).length
      analysis.estimatedRecords = braceCount
    }

    return analysis
  }

  private static async analyzeJsonlFile(file: File, analysis: FileAnalysis): Promise<FileAnalysis> {
    const text = await this.readFileAsText(file, 1024 * 5) // Read first 5KB
    const lines = text.split("\n").filter((line) => line.trim())

    analysis.estimatedRecords = Math.floor(file.size / (text.length / lines.length))

    if (lines.length > 0) {
      try {
        const firstRecord = JSON.parse(lines[0])
        analysis.detectedFields = this.extractJsonFields(firstRecord)
      } catch (error) {
        // Invalid JSON line
      }
    }

    return analysis
  }

  private static async readFileAsText(file: File, maxBytes?: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject

      if (maxBytes && file.size > maxBytes) {
        reader.readAsText(file.slice(0, maxBytes))
      } else {
        reader.readAsText(file)
      }
    })
  }

  private static detectCsvHeader(firstLine: string, delimiter: string): boolean {
    const fields = firstLine.split(delimiter)

    // Check if fields look like headers (contain letters, no purely numeric)
    const hasTextFields = fields.some((field) => /[a-zA-Z]/.test(field.replace(/['"]/g, "")))

    const allNumeric = fields.every((field) => !isNaN(Number(field.replace(/['"]/g, "").trim())))

    return hasTextFields && !allNumeric
  }

  private static extractJsonFields(
    obj: any,
    prefix = "",
  ): Array<{
    name: string
    type: string
    nullable: boolean
  }> {
    const fields: Array<{ name: string; type: string; nullable: boolean }> = []

    for (const [key, value] of Object.entries(obj)) {
      const fieldName = prefix ? `${prefix}.${key}` : key

      if (value === null || value === undefined) {
        fields.push({ name: fieldName, type: "string", nullable: true })
      } else if (Array.isArray(value)) {
        fields.push({ name: fieldName, type: "array", nullable: false })
      } else if (typeof value === "object") {
        fields.push({ name: fieldName, type: "object", nullable: false })
        // Recursively extract nested fields (limit depth)
        if (prefix.split(".").length < 2) {
          fields.push(...this.extractJsonFields(value, fieldName))
        }
      } else {
        fields.push({
          name: fieldName,
          type: this.inferDataType([String(value)]),
          nullable: false,
        })
      }
    }

    return fields
  }

  private static inferDataType(values: string[]): string {
    if (values.length === 0) return "string"

    const nonEmptyValues = values.filter((v) => v && v.trim())
    if (nonEmptyValues.length === 0) return "string"

    // Check for integers
    if (nonEmptyValues.every((v) => /^-?\d+$/.test(v.trim()))) {
      return "integer"
    }

    // Check for decimals
    if (nonEmptyValues.every((v) => /^-?\d*\.?\d+$/.test(v.trim()))) {
      return "number"
    }

    // Check for booleans
    if (nonEmptyValues.every((v) => /^(true|false|yes|no|1|0)$/i.test(v.trim()))) {
      return "boolean"
    }

    // Check for dates
    if (nonEmptyValues.every((v) => !isNaN(Date.parse(v)))) {
      return "timestamp"
    }

    // Check for emails
    if (nonEmptyValues.every((v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()))) {
      return "string" // Could add format: email
    }

    return "string"
  }
}
