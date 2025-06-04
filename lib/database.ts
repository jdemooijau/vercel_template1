// Supabase database connection and utilities
import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Create Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient<Database>(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export class DatabaseManager {
  private client = supabase

  async isHealthy(): Promise<boolean> {
    try {
      const { error } = await this.client.from("data_contracts").select("count").limit(1)
      return !error
    } catch {
      return false
    }
  }

  // Helper method to get authenticated user
  async getCurrentUser() {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser()
    if (error) throw error
    return user
  }
}

// Singleton instance
let dbManager: DatabaseManager | null = null

export function getDatabaseManager(): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager()
  }
  return dbManager
}
