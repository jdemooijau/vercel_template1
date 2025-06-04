import type { DataContract } from "@/types/data-contract"
import { supabase } from "@/lib/database"

export class DataContractRepository {
  async create(contract: DataContract, createdBy: string): Promise<DataContract> {
    const { data, error } = await supabase
      .from("data_contracts")
      .insert({
        id: contract.id,
        specification_version: contract.dataContractSpecification,
        title: contract.info.title,
        version: contract.info.version,
        description: contract.info.description,
        owner: contract.info.owner,
        contact_name: contract.info.contact?.name,
        contact_email: contract.info.contact?.email,
        contact_url: contract.info.contact?.url,
        tags: contract.info.tags,
        servers: contract.servers,
        terms: contract.terms,
        models: contract.models,
        service_level: contract.serviceLevel,
        quality_metrics: contract.quality,
        pricing_info: contract.pricing,
        collaboration_info: contract.collaboration,
        created_by: createdBy,
        status: "draft",
      })
      .select()
      .single()

    if (error) throw error
    return contract
  }

  async findById(id: string): Promise<DataContract | null> {
    const { data, error } = await supabase.from("data_contracts").select("*").eq("id", id).single()

    if (error) {
      if (error.code === "PGRST116") return null // Not found
      throw error
    }

    return this.mapRowToContract(data)
  }

  async findAll(filters?: {
    status?: string
    owner?: string
    search?: string
  }): Promise<DataContract[]> {
    let query = supabase.from("data_contracts").select("*")

    if (filters?.status) {
      query = query.eq("status", filters.status)
    }

    if (filters?.owner) {
      query = query.eq("owner", filters.owner)
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
    }

    const { data, error } = await query.order("created_at", { ascending: false })

    if (error) throw error
    return data?.map((row) => this.mapRowToContract(row)) || []
  }

  async update(id: string, contract: Partial<DataContract>): Promise<DataContract | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const updated = { ...existing, ...contract }

    const { data, error } = await supabase
      .from("data_contracts")
      .update({
        title: updated.info.title,
        version: updated.info.version,
        description: updated.info.description,
        owner: updated.info.owner,
        contact_name: updated.info.contact?.name,
        contact_email: updated.info.contact?.email,
        contact_url: updated.info.contact?.url,
        tags: updated.info.tags,
        servers: updated.servers,
        terms: updated.terms,
        models: updated.models,
        service_level: updated.serviceLevel,
        quality_metrics: updated.quality,
        pricing_info: updated.pricing,
        collaboration_info: updated.collaboration,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return updated
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase.from("data_contracts").delete().eq("id", id)

    if (error) throw error
    return true
  }

  private mapRowToContract(row: any): DataContract {
    return {
      dataContractSpecification: row.specification_version,
      id: row.id,
      info: {
        title: row.title,
        version: row.version,
        description: row.description || undefined,
        owner: row.owner,
        contact: row.contact_email
          ? {
              name: row.contact_name || undefined,
              email: row.contact_email,
              url: row.contact_url || undefined,
            }
          : undefined,
        tags: row.tags || undefined,
      },
      servers: row.servers || undefined,
      terms: row.terms || undefined,
      models: row.models,
      serviceLevel: row.service_level || undefined,
      quality: row.quality_metrics || undefined,
      pricing: row.pricing_info || undefined,
      collaboration: row.collaboration_info || undefined,
    }
  }
}
