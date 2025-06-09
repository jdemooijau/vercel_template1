// API Configuration for different environments
export interface ApiConfig {
  name?: string
  baseUrl: string
  clientId: string
  clientSecret?: string
  tenantId?: string
  scope?: string
  timeout?: number
  retryAttempts?: number
  retryDelay?: number
}

export const getApiConfig = (): ApiConfig => {
  const environment = process.env.NEXT_PUBLIC_API_ENVIRONMENT || "development"

  const configs: Record<string, ApiConfig> = {
    development: {
      name: "Development",
      baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev-api.epi-use.com",
      clientId: process.env.NEXT_PUBLIC_DEV_CLIENT_ID || "",
      // Server-side only values - don't access on client
      scope: "api://data-platform-dev/.default",
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    staging: {
      name: "Staging",
      baseUrl: process.env.NEXT_PUBLIC_STAGING_BASE_URL || "https://staging-api.epi-use.com",
      clientId: process.env.NEXT_PUBLIC_STAGING_CLIENT_ID || "",
      scope: "api://data-platform-staging/.default",
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
    production: {
      name: "Production",
      baseUrl: process.env.NEXT_PUBLIC_PROD_BASE_URL || "https://api.epi-use.com",
      clientId: process.env.NEXT_PUBLIC_PROD_CLIENT_ID || "",
      scope: "api://data-platform/.default",
      timeout: 60000,
      retryAttempts: 5,
      retryDelay: 2000,
    },
  }

  const config = configs[environment]
  if (!config) {
    throw new Error(`Invalid API environment: ${environment}. Valid options: ${Object.keys(configs).join(", ")}`)
  }

  return config
}

// Server-side only configuration - use this in API routes and server components
export const getServerApiConfig = (): ApiConfig => {
  // Only access server-side environment variables here
  if (typeof window !== "undefined") {
    throw new Error("getServerApiConfig can only be called on the server side")
  }

  const environment = process.env.NEXT_PUBLIC_API_ENVIRONMENT || "development"
  const baseConfig = getApiConfig()

  // Add server-side secrets
  const serverSecrets = {
    development: {
      clientSecret: process.env.DEV_CLIENT_SECRET,
      tenantId: process.env.DEV_TENANT_ID,
    },
    staging: {
      clientSecret: process.env.STAGING_CLIENT_SECRET,
      tenantId: process.env.STAGING_TENANT_ID,
    },
    production: {
      clientSecret: process.env.PROD_CLIENT_SECRET,
      tenantId: process.env.PROD_TENANT_ID,
    },
  }

  const secrets = serverSecrets[environment as keyof typeof serverSecrets] || {}

  return {
    ...baseConfig,
    ...secrets,
  }
}

// Demo configuration for development without env vars
export const getDemoConfig = (): ApiConfig => ({
  name: "Demo",
  baseUrl: "https://demo-api.epi-use.com",
  clientId: "demo-client-id",
  scope: "api://data-platform-demo/.default",
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
})

// Rate limiting configuration
export const RATE_LIMITS = {
  standard: {
    requestsPerHour: 1000,
    requestsPerMinute: 100,
    burstLimit: 20,
  },
  premium: {
    requestsPerHour: 5000,
    requestsPerMinute: 500,
    burstLimit: 100,
  },
  enterprise: {
    requestsPerHour: 20000,
    requestsPerMinute: 2000,
    burstLimit: 500,
  },
}

// Supported file formats
export const SUPPORTED_FORMATS = {
  input: ["csv", "json", "xlsx", "xls", "parquet", "avro", "orc", "xml", "yaml", "tsv", "txt", "sql", "jsonl"],
  output: ["csv", "json", "parquet", "avro", "orc", "xlsx", "xml", "yaml", "sql", "delta"],
}

// API endpoints configuration
export const API_ENDPOINTS = {
  auth: {
    token: "/auth/token",
    refresh: "/auth/refresh",
    revoke: "/auth/revoke",
  },
  projects: {
    list: "/api/projects",
    create: "/api/projects",
    get: "/api/projects({id})",
    update: "/api/projects({id})",
    delete: "/api/projects({id})",
    generateMetadata: "/api/projects/generate-metadata",
  },
  processes: {
    list: "/api/processes",
    get: "/api/processes({id})",
    cancel: "/api/processes({id})/cancel",
    retry: "/api/processes({id})/retry",
    conversion: "/api/processes/conversion",
    output: "/api/processes({id})/output",
  },
  queue: {
    files: "/api/queue/files",
    upload: "/api/queue/files",
    get: "/api/queue/files({id})",
    delete: "/api/queue/files({id})",
  },
  validation: {
    validate: "/api/validation/validate",
    rules: "/api/validation/rules",
  },
  quality: {
    assess: "/api/quality/assess({id})",
    profile: "/api/profiling/profile({id})",
    metrics: "/api/quality/metrics",
  },
  schema: {
    discover: "/api/schema/discover({id})",
    compare: "/api/schema/compare",
    suggest: "/api/schema/suggest",
  },
  lineage: {
    get: "/api/lineage({id})",
    trace: "/api/lineage/trace",
  },
  monitoring: {
    health: "/api/monitoring/health",
    metrics: "/api/monitoring/metrics",
    logs: "/api/monitoring/logs",
  },
  catalog: {
    assets: "/api/catalog/assets",
    search: "/api/catalog/search",
    register: "/api/catalog/register",
  },
  compliance: {
    check: "/api/compliance/check",
    policies: "/api/compliance/policies",
    audit: "/api/compliance/audit",
  },
  transformations: {
    create: "/api/transformations",
    list: "/api/transformations",
    get: "/api/transformations({id})",
    execute: "/api/transformations({id})/execute",
  },
  batch: {
    operations: "/api/batch/operations",
    status: "/api/batch/status({id})",
  },
}

// Environment validation helper - server-side only
export const validateEnvironment = (): { isValid: boolean; errors: string[] } => {
  if (typeof window !== "undefined") {
    // Client-side validation - only check public vars
    const errors: string[] = []
    const environment = process.env.NEXT_PUBLIC_API_ENVIRONMENT || "development"

    const requiredPublicVars = ["NEXT_PUBLIC_API_ENVIRONMENT", `NEXT_PUBLIC_${environment.toUpperCase()}_CLIENT_ID`]

    requiredPublicVars.forEach((varName) => {
      if (!process.env[varName]) {
        errors.push(`Missing required public environment variable: ${varName}`)
      }
    })

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  // Server-side validation
  const errors: string[] = []
  const environment = process.env.NEXT_PUBLIC_API_ENVIRONMENT || "development"

  // Skip validation in development mode
  if (process.env.NODE_ENV === "development") {
    return { isValid: true, errors: [] }
  }

  const requiredVars = [
    `NEXT_PUBLIC_${environment.toUpperCase()}_CLIENT_ID`,
    `${environment.toUpperCase()}_CLIENT_SECRET`,
    `${environment.toUpperCase()}_TENANT_ID`,
  ]

  requiredVars.forEach((varName) => {
    if (!process.env[varName]) {
      errors.push(`Missing required environment variable: ${varName}`)
    }
  })

  return {
    isValid: errors.length === 0,
    errors,
  }
}
