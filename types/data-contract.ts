// Core data contract types based on Data Contract Specification
export interface DataContract {
  id: string
  dataContractSpecification: string
  info: {
    title: string
    version: string
    description?: string
    owner: string
    contact?: {
      name?: string
      email?: string
      url?: string
    }
  }
  servers?: Record<string, ServerInfo>
  terms?: {
    usage?: string
    limitations?: string
    billing?: string
    noticePeriod?: string
  }
  models: Record<string, ModelDefinition>
  serviceLevel?: {
    availability?: string
    retention?: string
    latency?: string
    freshness?: string
    frequency?: string
    support?: string
    backup?: string
  }
  quality?: QualityMetrics
  pricing?: PricingInfo
  collaboration?: CollaborationInfo
  tags?: string[]
  status?: "draft" | "active" | "deprecated" | "archived"
  createdAt?: string
  updatedAt?: string
  createdBy?: string
}

export interface ServerInfo {
  type: "bigquery" | "snowflake" | "redshift" | "databricks" | "s3" | "gcs" | "azure" | "kafka" | "postgres" | "mysql"
  host?: string
  port?: number
  database?: string
  schema?: string
  path?: string
  format?: "parquet" | "delta" | "csv" | "json" | "avro"
  delimiter?: string
  description?: string
  environment?: string
  roles?: string[]
  tags?: string[]
}

export interface ModelDefinition {
  type: "table" | "view" | "object"
  description?: string
  fields: Record<string, FieldDefinition>
  primaryKey?: string[]
  constraints?: ConstraintDefinition[]
  tags?: string[]
}

export interface FieldDefinition {
  type: "string" | "integer" | "number" | "boolean" | "timestamp" | "date" | "array" | "object" | "decimal"
  description?: string
  required?: boolean
  unique?: boolean
  format?: string
  pattern?: string
  minLength?: number
  maxLength?: number
  minimum?: number
  maximum?: number
  enum?: string[]
  example?: any
  pii?: boolean
  classification?: "public" | "internal" | "confidential" | "restricted"
  tags?: string[]
  references?: string
}

export interface ConstraintDefinition {
  type: "primary_key" | "foreign_key" | "unique" | "not_null" | "check"
  columns: string[]
  references?: {
    table: string
    columns: string[]
  }
  expression?: string
}

export interface QualityMetrics {
  completeness?: {
    threshold: number
    description?: string
  }
  accuracy?: {
    threshold: number
    description?: string
  }
  consistency?: {
    threshold: number
    description?: string
  }
  uniqueness?: {
    threshold: number
    description?: string
  }
  validity?: {
    threshold: number
    description?: string
  }
  freshness?: {
    threshold: string
    description?: string
  }
}

export interface PricingInfo {
  model: "free" | "subscription" | "usage" | "tiered" | "custom"
  currency?: string
  basePrice?: number
  pricePerUnit?: number
  unit?: string
  tiers?: PricingTier[]
  billingPeriod?: "monthly" | "yearly" | "daily"
  description?: string
}

export interface PricingTier {
  name: string
  from: number
  to?: number
  price: number
  description?: string
}

export interface CollaborationInfo {
  stakeholders: Stakeholder[]
  governance?: {
    dataOwner: string
    dataClassification: string
    retentionPolicy?: string
    accessPolicy?: string
  }
  sla?: {
    responseTime?: string
    availability?: string
    support?: string
  }
}

export interface Stakeholder {
  name: string
  role: "owner" | "steward" | "consumer" | "analyst" | "engineer"
  contact?: string
  responsibilities?: string[]
}

// Mapping and validation types
export interface MappingRule {
  id: string
  sourceField: string
  targetField: string
  transformation: string
  confidence: number
  status: "suggested" | "confirmed" | "modified" | "rejected"
  validationStatus?: "valid" | "invalid" | "warning" | "pending"
  validationMessage?: string
  sourceContract?: string
  targetContract?: string
  sourceContractField?: FieldDefinition
  targetContractField?: FieldDefinition
  createdAt?: string
  updatedAt?: string
  createdBy?: string
  modifiedBy?: string
}

export interface ValidationResult {
  ruleId: string
  fieldPath: string
  isValid: boolean
  severity: "error" | "warning" | "info"
  message: string
  suggestion?: string
  code?: string
}

export interface FileUpload {
  id: string
  filename: string
  size: number
  type: string
  uploadedAt: string
  metadata?: Record<string, any>
}

// Enrichment agent types
export interface EnrichmentAgent {
  id: string
  name: string
  type: "quality" | "lineage" | "cost" | "compliance" | "usage"
  status: "active" | "inactive" | "error"
  lastRun?: string
  config: Record<string, any>
}

export interface EnrichmentResult {
  agentId: string
  contractId: string
  timestamp: string
  enrichments: Record<string, any>
  confidence: number
  metadata?: Record<string, any>
}

// Database types for Supabase integration
export interface Database {
  public: {
    Tables: {
      data_contracts: {
        Row: {
          id: string
          specification_version: string
          title: string
          version: string
          description: string | null
          owner: string
          contact_name: string | null
          contact_email: string | null
          contact_url: string | null
          tags: any | null
          servers: any | null
          terms: any | null
          models: any
          service_level: any | null
          quality_metrics: any | null
          pricing_info: any | null
          collaboration_info: any | null
          created_at: string
          updated_at: string
          created_by: string | null
          status: string
        }
        Insert: {
          id: string
          specification_version?: string
          title: string
          version: string
          description?: string | null
          owner: string
          contact_name?: string | null
          contact_email?: string | null
          contact_url?: string | null
          tags?: any | null
          servers?: any | null
          terms?: any | null
          models: any
          service_level?: any | null
          quality_metrics?: any | null
          pricing_info?: any | null
          collaboration_info?: any | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          status?: string
        }
        Update: {
          id?: string
          specification_version?: string
          title?: string
          version?: string
          description?: string | null
          owner?: string
          contact_name?: string | null
          contact_email?: string | null
          contact_url?: string | null
          tags?: any | null
          servers?: any | null
          terms?: any | null
          models?: any
          service_level?: any | null
          quality_metrics?: any | null
          pricing_info?: any | null
          collaboration_info?: any | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          status?: string
        }
      }
      mapping_projects: {
        Row: {
          id: string
          name: string
          description: string | null
          source_contract_id: string | null
          target_contract_id: string | null
          status: string
          created_at: string
          updated_at: string
          created_by: string
          metadata: any | null
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          source_contract_id?: string | null
          target_contract_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by: string
          metadata?: any | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          source_contract_id?: string | null
          target_contract_id?: string | null
          status?: string
          created_at?: string
          updated_at?: string
          created_by?: string
          metadata?: any | null
        }
      }
      mapping_rules: {
        Row: {
          id: string
          project_id: string
          source_field: string
          target_field: string
          transformation: string | null
          confidence_score: number
          status: string
          validation_status: string
          validation_message: string | null
          source_contract_field: any | null
          target_contract_field: any | null
          created_at: string
          updated_at: string
          created_by: string | null
          modified_by: string | null
        }
        Insert: {
          id: string
          project_id: string
          source_field: string
          target_field: string
          transformation?: string | null
          confidence_score?: number
          status?: string
          validation_status?: string
          validation_message?: string | null
          source_contract_field?: any | null
          target_contract_field?: any | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          modified_by?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          source_field?: string
          target_field?: string
          transformation?: string | null
          confidence_score?: number
          status?: string
          validation_status?: string
          validation_message?: string | null
          source_contract_field?: any | null
          target_contract_field?: any | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
          modified_by?: string | null
        }
      }
      file_uploads: {
        Row: {
          id: string
          project_id: string
          filename: string
          original_filename: string
          file_type: string
          mime_type: string | null
          file_size: number | null
          file_path: string | null
          upload_status: string
          metadata: any | null
          created_at: string
          updated_at: string
          uploaded_by: string
        }
        Insert: {
          id: string
          project_id: string
          filename: string
          original_filename: string
          file_type: string
          mime_type?: string | null
          file_size?: number | null
          file_path?: string | null
          upload_status?: string
          metadata?: any | null
          created_at?: string
          updated_at?: string
          uploaded_by: string
        }
        Update: {
          id?: string
          project_id?: string
          filename?: string
          original_filename?: string
          file_type?: string
          mime_type?: string | null
          file_size?: number | null
          file_path?: string | null
          upload_status?: string
          metadata?: any | null
          created_at?: string
          updated_at?: string
          uploaded_by?: string
        }
      }
      data_queue: {
        Row: {
          reqid: string
          filename: string
          file_type: string
          app_name: string
          sftp_user: string | null
          country_code: string | null
          customer_id: string | null
          ident1: string | null
          ident2: string | null
          file_size: number | null
          file_path: string | null
          status: string
          metadata: any | null
          created_at: string
          updated_at: string
          processed_at: string | null
          error_message: string | null
        }
        Insert: {
          reqid: string
          filename: string
          file_type: string
          app_name: string
          sftp_user?: string | null
          country_code?: string | null
          customer_id?: string | null
          ident1?: string | null
          ident2?: string | null
          file_size?: number | null
          file_path?: string | null
          status?: string
          metadata?: any | null
          created_at?: string
          updated_at?: string
          processed_at?: string | null
          error_message?: string | null
        }
        Update: {
          reqid?: string
          filename?: string
          file_type?: string
          app_name?: string
          sftp_user?: string | null
          country_code?: string | null
          customer_id?: string | null
          ident1?: string | null
          ident2?: string | null
          file_size?: number | null
          file_path?: string | null
          status?: string
          metadata?: any | null
          created_at?: string
          updated_at?: string
          processed_at?: string | null
          error_message?: string | null
        }
      }
    }
  }
}
