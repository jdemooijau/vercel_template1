// Supabase database types generated from schema
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
