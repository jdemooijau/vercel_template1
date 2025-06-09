"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Activity, CheckCircle, AlertTriangle, XCircle, RefreshCw, Server, Database, Zap, Clock } from "lucide-react"
import { getODataService } from "@/lib/odata-service"

interface SystemHealth {
  status: "healthy" | "degraded" | "unhealthy"
  services: Array<{
    name: string
    status: "up" | "down" | "degraded"
    responseTime: number
    lastCheck: string
  }>
  metrics: {
    activeProcesses: number
    queuedFiles: number
    errorRate: number
    throughput: number
  }
}

export function ApiStatusMonitor() {
  const [health, setHealth] = useState<SystemHealth | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchSystemHealth = async () => {
    setLoading(true)
    setError(null)

    try {
      const service = getODataService()
      const healthData = await service.getSystemHealth()
      setHealth(healthData)
      setLastUpdate(new Date())
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSystemHealth()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemHealth, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "up":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "unhealthy":
      case "down":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Activity className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
      case "up":
        return <Badge className="bg-green-100 text-green-800">Healthy</Badge>
      case "degraded":
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>
      case "unhealthy":
      case "down":
        return <Badge className="bg-red-100 text-red-800">Down</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "database":
        return <Database className="h-4 w-4" />
      case "api":
        return <Server className="h-4 w-4" />
      case "processing":
        return <Zap className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">Failed to fetch system status: {error}</AlertDescription>
          </Alert>
          <Button onClick={fetchSystemHealth} disabled={loading} className="mt-4" variant="outline">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!health) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Loading system status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon(health.status)}
              <CardTitle>System Status</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(health.status)}
              <Button onClick={fetchSystemHealth} disabled={loading} size="sm" variant="outline">
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </div>
          {lastUpdate && (
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Last updated: {lastUpdate.toLocaleTimeString()}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{health.metrics.activeProcesses}</div>
              <div className="text-sm text-slate-600">Active Processes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{health.metrics.queuedFiles}</div>
              <div className="text-sm text-slate-600">Queued Files</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{health.metrics.errorRate.toFixed(1)}%</div>
              <div className="text-sm text-slate-600">Error Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{health.metrics.throughput}</div>
              <div className="text-sm text-slate-600">Throughput/min</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card>
        <CardHeader>
          <CardTitle>Service Health</CardTitle>
          <CardDescription>Individual service status and response times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {health.services.map((service) => (
              <div key={service.name} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getServiceIcon(service.name)}
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-sm text-slate-600">
                      Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium">{service.responseTime}ms</div>
                    <div className="text-xs text-slate-600">Response time</div>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
          <CardDescription>System performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Error Rate</span>
                <span>{health.metrics.errorRate.toFixed(1)}%</span>
              </div>
              <Progress
                value={health.metrics.errorRate}
                className={`h-2 ${health.metrics.errorRate > 5 ? "bg-red-100" : "bg-green-100"}`}
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>System Load</span>
                <span>{Math.min(100, (health.metrics.activeProcesses / 10) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(100, (health.metrics.activeProcesses / 10) * 100)} className="h-2" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Queue Utilization</span>
                <span>{Math.min(100, (health.metrics.queuedFiles / 100) * 100).toFixed(0)}%</span>
              </div>
              <Progress value={Math.min(100, (health.metrics.queuedFiles / 100) * 100)} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
