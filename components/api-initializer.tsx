"use client"

import { useEffect, useState } from "react"
import { getApiConfig, getDemoConfig } from "@/lib/api-config"

export function ApiInitializer() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      // Only use client-safe configuration
      const config = getApiConfig()

      // Validate that we have the minimum required configuration
      if (!config.clientId && process.env.NODE_ENV === "production") {
        console.warn("Using demo configuration - not suitable for production")
        // Fall back to demo config in development
        const demoConfig = getDemoConfig()
        console.log("API initialized with demo configuration:", {
          name: demoConfig.name,
          baseUrl: demoConfig.baseUrl,
          environment: process.env.NEXT_PUBLIC_API_ENVIRONMENT || "development",
        })
      } else {
        console.log("API initialized successfully:", {
          name: config.name,
          baseUrl: config.baseUrl,
          environment: process.env.NEXT_PUBLIC_API_ENVIRONMENT || "development",
        })
      }

      setIsInitialized(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      console.error("Failed to initialize API configuration:", errorMessage)
    }
  }, [])

  // Don't render anything - this is just for initialization
  if (error) {
    console.error("API Initialization Error:", error)
  }

  return null
}
