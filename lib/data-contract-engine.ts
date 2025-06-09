import type {
  DataContract,
  MappingRule,
  ValidationResult,
  FieldDefinition,
  EnrichmentResult,
} from "@/types/data-contract"

export class DataContractEngine {
  private contracts: Map<string, DataContract> = new Map()

  constructor() {
    this.initializeSampleContracts()
  }

  private initializeSampleContracts() {
    // Sample Customer Data Contract
    const customerContract: DataContract = {
      id: "customer-data-v1",
      dataContractSpecification: "0.9.3",
      info: {
        title: "Customer Data Contract",
        version: "1.0.0",
        description: "Customer information from CRM system",
        owner: "Data Team",
        contact: {
          name: "John Smith",
          email: "john.smith@company.com",
        },
      },
      models: {
        customer: {
          type: "table",
          description: "Customer master data",
          fields: {
            id: {
              type: "integer",
              description: "Unique customer identifier",
              required: true,
              unique: true,
            },
            email: {
              type: "string",
              description: "Customer email address",
              required: true,
              format: "email",
              pii: true,
              classification: "confidential",
            },
            name: {
              type: "string",
              description: "Customer full name",
              required: true,
              pii: true,
              classification: "confidential",
            },
            phone: {
              type: "string",
              description: "Customer phone number",
              required: false,
              pattern: "^\\+?[1-9]\\d{1,14}$",
              pii: true,
              classification: "confidential",
            },
            created_at: {
              type: "timestamp",
              description: "Account creation timestamp",
              required: true,
            },
          },
        },
      },
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: "system",
    }

    // Sample Product Catalog Contract
    const productContract: DataContract = {
      id: "product-catalog-v1",
      dataContractSpecification: "0.9.3",
      info: {
        title: "Product Catalog Contract",
        version: "1.0.0",
        description: "Product information for e-commerce platform",
        owner: "Product Team",
        contact: {
          name: "Sarah Johnson",
          email: "sarah.johnson@company.com",
        },
      },
      models: {
        product: {
          type: "table",
          description: "Product catalog data",
          fields: {
            product_id: {
              type: "string",
              description: "Unique product identifier",
              required: true,
              unique: true,
            },
            name: {
              type: "string",
              description: "Product name",
              required: true,
              maxLength: 255,
            },
            price: {
              type: "decimal",
              description: "Product price",
              required: true,
              minimum: 0,
            },
            category: {
              type: "string",
              description: "Product category",
              required: false,
              enum: ["electronics", "clothing", "books", "home", "sports"],
            },
            description: {
              type: "string",
              description: "Product description",
              required: false,
            },
            created_at: {
              type: "timestamp",
              description: "Product creation timestamp",
              required: true,
            },
          },
        },
      },
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: "system",
    }

    this.contracts.set(customerContract.id, customerContract)
    this.contracts.set(productContract.id, productContract)
  }

  // Contract management methods
  getAllContracts(): DataContract[] {
    return Array.from(this.contracts.values())
  }

  getContract(id: string): DataContract | undefined {
    return this.contracts.get(id)
  }

  addContract(contract: DataContract): void {
    this.contracts.set(contract.id, contract)
  }

  updateContract(id: string, updates: Partial<DataContract>): DataContract | null {
    const existing = this.contracts.get(id)
    if (!existing) return null

    const updated = { ...existing, ...updates, updatedAt: new Date().toISOString() }
    this.contracts.set(id, updated)
    return updated
  }

  deleteContract(id: string): boolean {
    return this.contracts.delete(id)
  }

  // Mapping suggestion methods
  async suggestMappingsFromContracts(
    sourceContract: DataContract,
    targetContract: DataContract,
  ): Promise<MappingRule[]> {
    const mappings: MappingRule[] = []

    // Get all fields from source and target contracts
    const sourceFields = this.extractAllFields(sourceContract)
    const targetFields = this.extractAllFields(targetContract)

    // Generate mappings based on field similarity
    for (const [sourcePath, sourceField] of Object.entries(sourceFields)) {
      const bestMatch = this.findBestFieldMatch(sourcePath, sourceField, targetFields)

      if (bestMatch) {
        const mapping: MappingRule = {
          id: `mapping-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          sourceField: sourcePath,
          targetField: bestMatch.path,
          transformation: this.suggestTransformation(sourceField, bestMatch.field),
          confidence: bestMatch.confidence,
          status: "suggested",
          sourceContract: sourceContract.id,
          targetContract: targetContract.id,
          sourceContractField: sourceField,
          targetContractField: bestMatch.field,
          createdAt: new Date().toISOString(),
        }

        mappings.push(mapping)
      }
    }

    return mappings.sort((a, b) => b.confidence - a.confidence)
  }

  private extractAllFields(contract: DataContract): Record<string, FieldDefinition> {
    const fields: Record<string, FieldDefinition> = {}

    for (const [modelName, model] of Object.entries(contract.models)) {
      for (const [fieldName, field] of Object.entries(model.fields)) {
        const fullPath = `${modelName}.${fieldName}`
        fields[fullPath] = field
      }
    }

    return fields
  }

  private findBestFieldMatch(
    sourcePath: string,
    sourceField: FieldDefinition,
    targetFields: Record<string, FieldDefinition>,
  ): { path: string; field: FieldDefinition; confidence: number } | null {
    let bestMatch: { path: string; field: FieldDefinition; confidence: number } | null = null

    for (const [targetPath, targetField] of Object.entries(targetFields)) {
      const confidence = this.calculateFieldSimilarity(sourcePath, sourceField, targetPath, targetField)

      if (confidence > 0.5 && (!bestMatch || confidence > bestMatch.confidence)) {
        bestMatch = { path: targetPath, field: targetField, confidence }
      }
    }

    return bestMatch
  }

  private calculateFieldSimilarity(
    sourcePath: string,
    sourceField: FieldDefinition,
    targetPath: string,
    targetField: FieldDefinition,
  ): number {
    let score = 0

    // Name similarity (40% weight)
    const nameScore = this.calculateNameSimilarity(sourcePath, targetPath)
    score += nameScore * 0.4

    // Type compatibility (30% weight)
    const typeScore = this.calculateTypeCompatibility(sourceField.type, targetField.type)
    score += typeScore * 0.3

    // Description similarity (20% weight)
    if (sourceField.description && targetField.description) {
      const descScore = this.calculateTextSimilarity(sourceField.description, targetField.description)
      score += descScore * 0.2
    }

    // Format/pattern similarity (10% weight)
    if (sourceField.format && targetField.format) {
      score += (sourceField.format === targetField.format ? 1 : 0) * 0.1
    }

    return Math.min(score, 1)
  }

  private calculateNameSimilarity(source: string, target: string): number {
    const sourceName = source.split(".").pop()?.toLowerCase() || ""
    const targetName = target.split(".").pop()?.toLowerCase() || ""

    // Exact match
    if (sourceName === targetName) return 1

    // Common variations
    const variations: Record<string, string[]> = {
      id: ["identifier", "key", "pk"],
      email: ["email_address", "mail"],
      phone: ["phone_number", "telephone"],
      name: ["full_name", "display_name"],
      created_at: ["created_date", "creation_time", "date_created"],
    }

    for (const [key, alts] of Object.entries(variations)) {
      if ((sourceName === key && alts.includes(targetName)) || (targetName === key && alts.includes(sourceName))) {
        return 0.9
      }
    }

    // Levenshtein distance for partial matches
    const distance = this.levenshteinDistance(sourceName, targetName)
    const maxLength = Math.max(sourceName.length, targetName.length)
    return Math.max(0, 1 - distance / maxLength)
  }

  private calculateTypeCompatibility(sourceType: string, targetType: string): number {
    if (sourceType === targetType) return 1

    // Compatible type mappings
    const compatibleTypes: Record<string, string[]> = {
      string: ["string"],
      integer: ["integer", "number"],
      number: ["number", "integer", "decimal"],
      decimal: ["decimal", "number"],
      boolean: ["boolean"],
      timestamp: ["timestamp", "date"],
      date: ["date", "timestamp"],
      array: ["array"],
      object: ["object"],
    }

    const sourceCompatible = compatibleTypes[sourceType] || []
    return sourceCompatible.includes(targetType) ? 0.8 : 0.2
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/)
    const words2 = text2.toLowerCase().split(/\s+/)

    const intersection = words1.filter((word) => words2.includes(word))
    const union = [...new Set([...words1, ...words2])]

    return intersection.length / union.length
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1)
      .fill(null)
      .map(() => Array(str1.length + 1).fill(null))

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(matrix[j][i - 1] + 1, matrix[j - 1][i] + 1, matrix[j - 1][i - 1] + indicator)
      }
    }

    return matrix[str2.length][str1.length]
  }

  private suggestTransformation(sourceField: FieldDefinition, targetField: FieldDefinition): string {
    // Type conversion transformations
    if (sourceField.type !== targetField.type) {
      if (sourceField.type === "string" && targetField.type === "integer") {
        return "Convert string to integer"
      }
      if (sourceField.type === "string" && targetField.type === "timestamp") {
        return "Parse date string to timestamp"
      }
      if (sourceField.type === "integer" && targetField.type === "string") {
        return "Convert integer to string"
      }
    }

    // Format transformations
    if (targetField.format === "email" && sourceField.format !== "email") {
      return "Validate email format"
    }

    if (targetField.pattern && !sourceField.pattern) {
      return `Apply pattern: ${targetField.pattern}`
    }

    // Length constraints
    if (targetField.maxLength && !sourceField.maxLength) {
      return `Truncate to ${targetField.maxLength} characters`
    }

    return "None"
  }

  // Validation methods
  async validateMappingAgainstContract(
    mapping: MappingRule,
    sourceContract: DataContract,
    targetContract: DataContract,
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    // Validate source field exists
    const sourceField = this.getFieldFromContract(sourceContract, mapping.sourceField)
    if (!sourceField) {
      results.push({
        ruleId: mapping.id,
        fieldPath: mapping.sourceField,
        isValid: false,
        severity: "error",
        message: `Source field '${mapping.sourceField}' not found in contract '${sourceContract.info.title}'`,
        code: "FIELD_NOT_FOUND",
      })
    }

    // Validate target field exists
    const targetField = this.getFieldFromContract(targetContract, mapping.targetField)
    if (!targetField) {
      results.push({
        ruleId: mapping.id,
        fieldPath: mapping.targetField,
        isValid: false,
        severity: "error",
        message: `Target field '${mapping.targetField}' not found in contract '${targetContract.info.title}'`,
        code: "FIELD_NOT_FOUND",
      })
    }

    // Validate type compatibility
    if (sourceField && targetField) {
      const typeCompatibility = this.calculateTypeCompatibility(sourceField.type, targetField.type)
      if (typeCompatibility < 0.5) {
        results.push({
          ruleId: mapping.id,
          fieldPath: mapping.targetField,
          isValid: false,
          severity: "warning",
          message: `Type mismatch: ${sourceField.type} -> ${targetField.type}`,
          suggestion: "Consider adding a type conversion transformation",
          code: "TYPE_MISMATCH",
        })
      }

      // Validate required field mapping
      if (targetField.required && !sourceField.required) {
        results.push({
          ruleId: mapping.id,
          fieldPath: mapping.targetField,
          isValid: false,
          severity: "warning",
          message: `Target field is required but source field is optional`,
          suggestion: "Ensure default value or validation is provided",
          code: "REQUIRED_FIELD_MISMATCH",
        })
      }

      // Validate PII handling
      if (sourceField.pii && !targetField.pii) {
        results.push({
          ruleId: mapping.id,
          fieldPath: mapping.targetField,
          isValid: false,
          severity: "error",
          message: `PII data cannot be mapped to non-PII field`,
          suggestion: "Apply anonymization or remove PII classification",
          code: "PII_VIOLATION",
        })
      }
    }

    return results
  }

  private getFieldFromContract(contract: DataContract, fieldPath: string): FieldDefinition | null {
    const [modelName, fieldName] = fieldPath.split(".")
    const model = contract.models[modelName]
    if (!model) return null

    return model.fields[fieldName] || null
  }

  // Enrichment methods
  async enrichContract(contractId: string, agentType: string): Promise<EnrichmentResult> {
    const contract = this.getContract(contractId)
    if (!contract) {
      throw new Error(`Contract ${contractId} not found`)
    }

    // Simulate enrichment based on agent type
    const enrichments: Record<string, any> = {}

    switch (agentType) {
      case "quality":
        enrichments.qualityScore = Math.random() * 100
        enrichments.completeness = Math.random() * 100
        enrichments.accuracy = Math.random() * 100
        break

      case "lineage":
        enrichments.upstreamSources = ["system_a", "system_b"]
        enrichments.downstreamConsumers = ["dashboard_x", "report_y"]
        break

      case "cost":
        enrichments.estimatedCost = Math.random() * 1000
        enrichments.costPerRecord = Math.random() * 0.01
        break

      case "usage":
        enrichments.dailyQueries = Math.floor(Math.random() * 1000)
        enrichments.uniqueUsers = Math.floor(Math.random() * 50)
        break
    }

    return {
      agentId: `agent-${agentType}`,
      contractId,
      timestamp: new Date().toISOString(),
      enrichments,
      confidence: Math.random() * 100,
    }
  }

  // Search and discovery methods
  searchContracts(query: string): DataContract[] {
    const lowercaseQuery = query.toLowerCase()

    return this.getAllContracts().filter((contract) => {
      // Search in title, description, and field names
      const titleMatch = contract.info.title.toLowerCase().includes(lowercaseQuery)
      const descMatch = contract.info.description?.toLowerCase().includes(lowercaseQuery)

      // Search in field names and descriptions
      const fieldMatch = Object.values(contract.models).some((model) =>
        Object.entries(model.fields).some(
          ([fieldName, field]) =>
            fieldName.toLowerCase().includes(lowercaseQuery) ||
            field.description?.toLowerCase().includes(lowercaseQuery),
        ),
      )

      return titleMatch || descMatch || fieldMatch
    })
  }

  // Contract comparison methods
  compareContracts(
    contract1Id: string,
    contract2Id: string,
  ): {
    commonFields: string[]
    uniqueToFirst: string[]
    uniqueToSecond: string[]
    typeConflicts: Array<{ field: string; type1: string; type2: string }>
  } {
    const contract1 = this.getContract(contract1Id)
    const contract2 = this.getContract(contract2Id)

    if (!contract1 || !contract2) {
      throw new Error("One or both contracts not found")
    }

    const fields1 = this.extractAllFields(contract1)
    const fields2 = this.extractAllFields(contract2)

    const fieldNames1 = new Set(Object.keys(fields1))
    const fieldNames2 = new Set(Object.keys(fields2))

    const commonFields = Array.from(fieldNames1).filter((field) => fieldNames2.has(field))
    const uniqueToFirst = Array.from(fieldNames1).filter((field) => !fieldNames2.has(field))
    const uniqueToSecond = Array.from(fieldNames2).filter((field) => !fieldNames1.has(field))

    const typeConflicts = commonFields
      .filter((field) => fields1[field].type !== fields2[field].type)
      .map((field) => ({
        field,
        type1: fields1[field].type,
        type2: fields2[field].type,
      }))

    return {
      commonFields,
      uniqueToFirst,
      uniqueToSecond,
      typeConflicts,
    }
  }
}
