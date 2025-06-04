// Real AI service using Grok integration
import { generateText } from "ai"
import { createOpenAI } from "@ai-sdk/openai"
import type { DataContract, MappingRule } from "@/types/data-contract"

// Initialize Grok client
const grok = createOpenAI({
  apiKey: process.env.XAI_API_KEY!,
  baseURL: "https://api.x.ai/v1",
})

export interface AIAnalysisResult {
  mappings: MappingRule[]
  confidence: number
  suggestions: string[]
  warnings: string[]
}

export class AIService {
  private model = grok("grok-beta")

  async analyzeMappingRequirements(
    sourceContract?: DataContract,
    targetContract?: DataContract,
    sourceDocument?: string,
    targetDocument?: string,
    sourceSample?: string,
    targetSample?: string,
  ): Promise<AIAnalysisResult> {
    try {
      const prompt = this.buildAnalysisPrompt({
        sourceContract,
        targetContract,
        sourceDocument,
        targetDocument,
        sourceSample,
        targetSample,
      })

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.3,
        maxTokens: 4000,
      })

      return this.parseAIResponse(text)
    } catch (error) {
      console.error("Grok AI analysis failed:", error)
      // Return fallback mappings instead of throwing
      return this.getFallbackMappings(sourceContract, targetContract)
    }
  }

  private buildAnalysisPrompt(context: {
    sourceContract?: DataContract
    targetContract?: DataContract
    sourceDocument?: string
    targetDocument?: string
    sourceSample?: string
    targetSample?: string
  }): string {
    let prompt = `You are an expert data mapping analyst. Analyze the provided information and generate precise field mappings between source and target data structures.

INSTRUCTIONS:
1. Generate field mappings with high accuracy
2. Suggest appropriate data transformations
3. Provide confidence scores (0-100) based on field similarity and data type compatibility
4. Identify potential data quality issues or mapping challenges
5. Return response as valid JSON with this exact structure:

{
  "mappings": [
    {
      "sourceField": "source.field.path",
      "targetField": "target.field.path", 
      "transformation": "transformation description",
      "confidence": 85,
      "reasoning": "explanation of mapping logic"
    }
  ],
  "overallConfidence": 78,
  "suggestions": ["improvement suggestions"],
  "warnings": ["potential issues"]
}

ANALYSIS CONTEXT:
`

    if (context.sourceContract) {
      prompt += `\n\nSOURCE CONTRACT SCHEMA:
${JSON.stringify(context.sourceContract.models, null, 2)}`
    }

    if (context.targetContract) {
      prompt += `\n\nTARGET CONTRACT SCHEMA:
${JSON.stringify(context.targetContract.models, null, 2)}`
    }

    if (context.sourceDocument) {
      prompt += `\n\nSOURCE DOCUMENTATION:
${context.sourceDocument.substring(0, 2000)}...`
    }

    if (context.targetDocument) {
      prompt += `\n\nTARGET DOCUMENTATION:
${context.targetDocument.substring(0, 2000)}...`
    }

    if (context.sourceSample) {
      prompt += `\n\nSOURCE DATA SAMPLE:
${context.sourceSample.substring(0, 1000)}...`
    }

    if (context.targetSample) {
      prompt += `\n\nTARGET DATA SAMPLE:
${context.targetSample.substring(0, 1000)}...`
    }

    prompt += `\n\nFOCUS ON:
- Exact field name matching and semantic similarity
- Data type compatibility and required transformations
- Business logic requirements for data conversion
- Data quality and validation requirements

Return only the JSON response, no additional text.`

    return prompt
  }

  private parseAIResponse(response: string): AIAnalysisResult {
    try {
      // Clean the response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? jsonMatch[0] : response
      const parsed = JSON.parse(jsonStr)

      const mappings: MappingRule[] = (parsed.mappings || []).map((m: any, index: number) => ({
        id: `grok-rule-${Date.now()}-${index}`,
        sourceField: m.sourceField || "",
        targetField: m.targetField || "",
        transformation: m.transformation || "None",
        confidence: Math.min(100, Math.max(0, m.confidence || 50)),
        status: "suggested" as const,
        sourceContract: "",
        targetContract: "",
      }))

      return {
        mappings,
        confidence: Math.min(100, Math.max(0, parsed.overallConfidence || 50)),
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
        warnings: Array.isArray(parsed.warnings) ? parsed.warnings : [],
      }
    } catch (error) {
      console.error("Failed to parse Grok AI response:", error)
      console.log("Raw response:", response)

      // Return empty result on parse failure
      return {
        mappings: [],
        confidence: 0,
        suggestions: ["AI analysis failed - please try again"],
        warnings: ["Could not parse AI response"],
      }
    }
  }

  private getFallbackMappings(sourceContract?: DataContract, targetContract?: DataContract): AIAnalysisResult {
    const mappings: MappingRule[] = []

    // Generate basic mappings if contracts are available
    if (sourceContract && targetContract) {
      const sourceFields = this.extractFieldsFromContract(sourceContract)
      const targetFields = this.extractFieldsFromContract(targetContract)

      targetFields.forEach((targetField, index) => {
        const matchingSource = sourceFields.find(
          (sf) =>
            sf.toLowerCase().includes(targetField.toLowerCase()) ||
            targetField.toLowerCase().includes(sf.toLowerCase()),
        )

        if (matchingSource) {
          mappings.push({
            id: `fallback-rule-${Date.now()}-${index}`,
            sourceField: matchingSource,
            targetField: targetField,
            transformation: "Direct mapping",
            confidence: 70,
            status: "suggested",
            sourceContract: sourceContract.id,
            targetContract: targetContract.id,
          })
        }
      })
    }

    return {
      mappings,
      confidence: 70,
      suggestions: ["AI service temporarily unavailable - using basic field matching"],
      warnings: ["Please verify mappings manually"],
    }
  }

  private extractFieldsFromContract(contract: DataContract): string[] {
    const fields: string[] = []

    Object.entries(contract.models).forEach(([modelName, model]) => {
      Object.keys(model.fields).forEach((fieldName) => {
        fields.push(`${modelName}.${fieldName}`)
      })
    })

    return fields
  }

  async validateMapping(
    rule: MappingRule,
    sourceContract?: DataContract,
    targetContract?: DataContract,
  ): Promise<{
    isValid: boolean
    confidence: number
    suggestions: string[]
    warnings: string[]
  }> {
    try {
      const prompt = `Validate this data mapping rule:
Source: ${rule.sourceField}
Target: ${rule.targetField}
Transformation: ${rule.transformation}

${sourceContract ? `Source Contract: ${JSON.stringify(sourceContract.models, null, 2)}` : ""}
${targetContract ? `Target Contract: ${JSON.stringify(targetContract.models, null, 2)}` : ""}

Return JSON: {"isValid": boolean, "confidence": number, "suggestions": [], "warnings": []}`

      const { text } = await generateText({
        model: this.model,
        prompt,
        temperature: 0.2,
        maxTokens: 1000,
      })

      const result = JSON.parse(text)
      return {
        isValid: result.isValid || false,
        confidence: Math.min(100, Math.max(0, result.confidence || 50)),
        suggestions: result.suggestions || [],
        warnings: result.warnings || [],
      }
    } catch (error) {
      console.error("Validation failed:", error)
      return {
        isValid: true,
        confidence: 50,
        suggestions: [],
        warnings: ["Could not validate mapping with AI"],
      }
    }
  }
}
