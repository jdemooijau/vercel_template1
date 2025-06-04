// Environment configuration and validation
export interface EnvironmentConfig {
  // Database
  database: {
    host: string
    port: number
    user: string
    password: string
    name: string
    ssl: boolean
  }

  // File Storage
  storage: {
    type: "local" | "s3" | "azure"
    path?: string
    bucket?: string
    region?: string
    accessKey?: string
    secretKey?: string
  }

  // AI Services
  ai: {
    provider: "openai" | "azure" | "anthropic"
    apiKey: string
    model: string
    endpoint?: string
  }

  // Security
  security: {
    jwtSecret: string
    encryptionKey: string
    corsOrigins: string[]
  }

  // Application
  app: {
    environment: "development" | "staging" | "production"
    port: number
    logLevel: "debug" | "info" | "warn" | "error"
    maxFileSize: number
  }
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const requiredEnvVars = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME", "JWT_SECRET", "ENCRYPTION_KEY"]

  // Validate required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is not set`)
    }
  }

  return {
    database: {
      host: process.env.DB_HOST!,
      port: Number.parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER!,
      password: process.env.DB_PASSWORD!,
      name: process.env.DB_NAME!,
      ssl: process.env.DB_SSL === "true",
    },

    storage: {
      type: (process.env.STORAGE_TYPE as any) || "local",
      path: process.env.STORAGE_PATH || "./uploads",
      bucket: process.env.STORAGE_BUCKET,
      region: process.env.STORAGE_REGION,
      accessKey: process.env.STORAGE_ACCESS_KEY,
      secretKey: process.env.STORAGE_SECRET_KEY,
    },

    ai: {
      provider: (process.env.AI_PROVIDER as any) || "openai",
      apiKey: process.env.AI_API_KEY || "",
      model: process.env.AI_MODEL || "gpt-4",
      endpoint: process.env.AI_ENDPOINT,
    },

    security: {
      jwtSecret: process.env.JWT_SECRET!,
      encryptionKey: process.env.ENCRYPTION_KEY!,
      corsOrigins: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    },

    app: {
      environment: (process.env.NODE_ENV as any) || "development",
      port: Number.parseInt(process.env.PORT || "3000"),
      logLevel: (process.env.LOG_LEVEL as any) || "info",
      maxFileSize: Number.parseInt(process.env.MAX_FILE_SIZE || "104857600"), // 100MB
    },
  }
}

export function validateEnvironment(): void {
  try {
    getEnvironmentConfig()
    console.log("✅ Environment configuration is valid")
  } catch (error) {
    console.error("❌ Environment configuration error:", error)
    process.exit(1)
  }
}
