import { supabase } from "@/lib/database"
import type { Database } from "@/types/supabase"

type MappingProject = Database["public"]["Tables"]["mapping_projects"]["Row"]
type MappingProjectInsert = Database["public"]["Tables"]["mapping_projects"]["Insert"]
type MappingProjectUpdate = Database["public"]["Tables"]["mapping_projects"]["Update"]

export class MappingProjectRepository {
  async create(project: MappingProjectInsert): Promise<MappingProject> {
    const { data, error } = await supabase.from("mapping_projects").insert(project).select().single()

    if (error) throw error
    return data
  }

  async findById(id: string): Promise<MappingProject | null> {
    const { data, error } = await supabase
      .from("mapping_projects")
      .select(`
        *,
        source_contract:source_contract_id(title, version),
        target_contract:target_contract_id(title, version)
      `)
      .eq("id", id)
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }

    return data
  }

  async findAll(filters?: {
    status?: string
    createdBy?: string
    search?: string
  }): Promise<MappingProject[]> {
    let query = supabase.from("mapping_projects").select(`
        *,
        source_contract:source_contract_id(title, version),
        target_contract:target_contract_id(title, version)
      `)

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.createdBy) {
      query = query.eq("created_by", filters.createdBy)
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data || []
  }

  async update(id: string, updates: MappingProjectUpdate): Promise<MappingProject | null> {
    const { data, error } = await supabase
      .from("mapping_projects")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single()

    if (error) {
      if (error.code === "PGRST116") return null
      throw error
    }

    return data
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("mapping_projects").delete().eq("id", id)

    if (error) throw error
    return true
  }

  async getProjectStats(projectId: string): Promise<{
    totalRules: number
    confirmedRules: number
    validRules: number
    avgConfidence: number
  }> {
    const { data, error } = await supabase
      .from("mapping_rules")
      .select("status, validation_status, confidence_score")
      .eq("project_id", projectId)

    if (error) throw error

    const rules = data || []
    const totalRules = rules.length
    const confirmedRules = rules.filter((r) => r.status === "confirmed").length
    const validRules = rules.filter((r) => r.validation_status === "valid").length
    const avgConfidence =
      rules.length > 0 ? rules.reduce((sum, r) => sum + (r.confidence_score || 0), 0) / rules.length : 0

    return {
      totalRules,
      confirmedRules,
      validRules,
      avgConfidence: Math.round(avgConfidence),
    }
  }
}
