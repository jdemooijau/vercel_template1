"use client"

import { useEffect, useState } from "react"
import { initializeODataService } from "@/lib/odata-service"
import { getApiConfig } from "@/lib/api-config"

export function ApiInitializer() {
  const [initStatus, setInitStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeApi = async () => {
      try {
        // Check if we're in a browser environment and have required env vars
        if (typeof window === "undefined") {
          console.log("API initialization skipped on server side")
          setInitStatus("success")
          return
        }

        // Check for required environment variables
        const environment = process.env.NEXT_PUBLIC_API_ENVIRONMENT || "development"
        const clientIdKey = `NEXT_PUBLIC_${environment.toUpperCase()}_CLIENT_ID`

        // For development, use a fallback if no env vars are set
        if (environment === "development") {
          const config = {
            baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || "https://dev-api.epi-use.com",
            clientId: process.env.NEXT_PUBLIC_DEV_CLIENT_ID || "demo-client-id",
            clientSecret: process.env.DEV_CLIENT_SECRET || "demo-secret",
            tenantId: process.env.DEV_TENANT_ID || "demo-tenant",
            scope: "api://data-platform-dev/.default",
            timeout: 30000,
            retryAttempts: 3,
          }

          initializeODataService(config)
          console.log(`OData service initialized for ${environment} environment (demo mode)`)
          setInitStatus("success")
          return
        }

        // For non-development environments, require proper configuration
        const config = getApiConfig()
        initializeODataService(config)
        console.log(`OData service initialized for ${config.name || environment} environment`)
        setInitStatus("success")
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
        console.warn("OData service initialization failed:", errorMessage)
        setError(errorMessage)
        setInitStatus("error")

        // In development, continue without API service
        if (process.env.NODE_ENV === "development") {
          console.log("Continuing in development mode without API service")
        }
      }
    }

    initializeApi()
  }, [])

  // Don't render anything in production if there's an error
  if (initStatus === "error" && process.env.NODE_ENV === "production") {
    return null
  }

  // In development, show a subtle indicator
  if (process.env.NODE_ENV === "development" && initStatus === "error") {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 py-2 rounded text-sm max-w-sm">
          <div className="font-medium">API Service Warning</div>
          <div className="text-xs mt-1">
            Running in demo mode. Configure environment variables for full API functionality.
          </div>
        </div>
      </div>
    )
  }

  return null
}
