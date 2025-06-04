// Core Data Contract Types based on Data Contract Specification
export interface DataContract {
  dataContractSpecification: string
  id: string
  info: ContractInfo
  servers?: Record<string, ServerInfo>
  terms?: ContractTerms
  models: Record<string, DataModel>
  serviceLevel?: ServiceLevel
  quality?: QualityMetrics
  pricing?: PricingInfo
  collaboration?: CollaborationInfo
}

export interface ContractInfo {
  title: string
  version: string
  description?: string
  owner: string
  contact?: ContactInfo
  tags?: string[]
}

export interface ContactInfo {
  name?: string
  email?: string
  url?: string
}

export interface ServerInfo {
  type: "bigquery" | "snowflake" | "s3" | "postgres" | "api" | "file"
  host?: string
  port?: number
  database?: string
  schema?: string
  path?: string
  format?: "parquet" | "csv" | "json" | "avro" | "xml"
  location?: string
  environment: "prod" | "staging" | "dev"
}

export interface ContractTerms {
  usage: string
  limitations?: string[]
  billing?: string
  noticePeriod?: string
}

export interface DataModel {
  type: "table" | "object" | "array"
  description?: string
  fields: Record<string, FieldDefinition>
}

export interface FieldDefinition {
  type: string
  description?: string
  required?: boolean
  unique?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  format?: string
  enum?: string[]
  pii?: boolean
  classification?: "public" | "internal" | "confidential" | "restricted"
  tags?: string[]
}

export interface ServiceLevel {
  availability?: {
    percentage: number
    period: string
  }
  retention?: {
    period: string
    archival?: string
  }
  latency?: {
    threshold: string
    percentile: number
  }
  freshness?: {
    threshold: string
    description?: string
  }
  frequency?: {
    type: "batch" | "streaming" | "on-demand"
    interval?: string
  }
  support?: {
    time: string
    responseTime: string
  }
}

export interface QualityMetrics {
  accuracy?: QualityRule[]
  completeness?: QualityRule[]
  consistency?: QualityRule[]
  timeliness?: QualityRule[]
  validity?: QualityRule[]
  uniqueness?: QualityRule[]
}

export interface QualityRule {
  description: string
  dimension: string
  type: "not_null" | "unique" | "accepted_values" | "relationships" | "custom"
  config?: Record<string, any>
  threshold?: number
  severity: "error" | "warn" | "info"
}

export interface PricingInfo {
  model: "free" | "subscription" | "usage" | "tiered"
  currency?: string
  unit?: string
  amount?: number
  tiers?: PricingTier[]
  billingPeriod?: "monthly" | "yearly" | "daily"
}

export interface PricingTier {
  name: string
  limit: number
  price: number
  features?: string[]
}

export interface CollaborationInfo {
  stakeholders: Stakeholder[]
  governance?: GovernanceInfo
  lineage?: LineageInfo[]
}

export interface Stakeholder {
  name: string
  role: "owner" | "steward" | "consumer" | "contributor"
  contact: ContactInfo
  responsibilities?: string[]
}

export interface GovernanceInfo {
  domain: string
  dataClassification: string
  retentionPolicy?: string
  accessPolicy?: string
  approvalProcess?: string
}

export interface LineageInfo {
  upstream?: DataSource[]
  downstream?: DataSource[]
}

export interface DataSource {
  name: string
  type: string
  description?: string
}

// Enrichment Types for Agentic Processing
export interface ContractEnrichment {
  contractId: string
  enrichmentType: "quality" | "pricing" | "collaboration" | "sla" | "lineage"
  source: "ai_analysis" | "user_input" | "system_monitoring" | "external_api"
  confidence: number
  timestamp: string
  data: Record<string, any>
}

export interface EnrichmentAgent {
  id: string
  name: string
  type: "quality_analyzer" | "cost_estimator" | "lineage_tracer" | "sla_monitor"
  config: Record<string, any>
  enabled: boolean
}

// Mapping Integration Types
export interface MappingProject {
  id: string
  name: string
  sourceContract?: DataContract
  targetContract?: DataContract
  sourceDocument?: FileUpload
  targetDocument?: FileUpload
  sourceSampleFile?: FileUpload
  targetSampleFile?: FileUpload
  mappingRules: MappingRule[]
  validationResults?: ValidationResult[]
  createdAt: string
  updatedAt: string
}

export interface FileUpload {
  id: string
  filename: string
  size: number
  type: string
  uploadedAt: string
  content?: string
  metadata?: Record<string, any>
}

export interface MappingRule {
  id: string
  sourceField: string
  targetField: string
  transformation: string
  confidence: number
  status: "suggested" | "confirmed" | "modified"
  validationStatus?: "valid" | "invalid" | "warning"
  validationMessage?: string
  sourceContract?: string
  targetContract?: string
}

export interface ValidationResult {
  ruleId: string
  isValid: boolean
  severity: "error" | "warning" | "info"
  message: string
  suggestion?: string
}

export interface ContractValidation {
  contractId: string
  fieldPath: string
  expectedType: string
  actualType?: string
  isValid: boolean
  message: string
}
