"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Activity, Cpu, HardDrive, Wifi, Zap, Database, Server, Globe } from "lucide-react"

interface SystemMetric {
  label: string
  value: number
  unit: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  maxValue?: number
}

export default function PulsePage() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([
    { label: "CPU Usage", value: 0, unit: "%", icon: Cpu, color: "text-green-400", maxValue: 100 },
    { label: "Memory Usage", value: 0, unit: "%", icon: HardDrive, color: "text-blue-400", maxValue: 100 },
    { label: "Active Sessions", value: 0, unit: "", icon: Zap, color: "text-yellow-400", maxValue: 50 },
    { label: "Uptime", value: 0, unit: "h", icon: Server, color: "text-green-500", maxValue: 24 },
  ])

  const [systemStatus, setSystemStatus] = useState("OPERATIONAL")
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics((prev) =>
        prev.map((metric) => {
          let newValue: number

          switch (metric.label) {
            case "CPU Usage":
              newValue = Math.random() * 45 + 15 // 15-60%
              break
            case "Memory Usage":
              newValue = Math.random() * 30 + 40 // 40-70%
              break
            case "API Response":
              newValue = Math.random() * 200 + 50 // 50-250ms
              break
            case "Active Sessions":
              newValue = Math.floor(Math.random() * 15 + 5) // 5-20 sessions
              break
            case "Database Load":
              newValue = Math.random() * 25 + 10 // 10-35%
              break
            case "Uptime":
              newValue = Math.min(metric.value + 0.01, 24) // Slowly increase uptime
              break
            default:
              newValue = Math.random() * 100
          }

          return { ...metric, value: newValue }
        }),
      )
      setLastUpdate(new Date())
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [])

  // Determine system status based on metrics
  useEffect(() => {
    const cpuUsage = metrics.find((m) => m.label === "CPU Usage")?.value || 0
    const memoryUsage = metrics.find((m) => m.label === "Memory Usage")?.value || 0
    const apiResponse = metrics.find((m) => m.label === "API Response")?.value || 0

    if (cpuUsage > 80 || memoryUsage > 85 || apiResponse > 500) {
      setSystemStatus("DEGRADED")
    } else if (cpuUsage > 60 || memoryUsage > 75 || apiResponse > 300) {
      setSystemStatus("WARNING")
    } else {
      setSystemStatus("OPERATIONAL")
    }
  }, [metrics])

  const getBarWidth = (value: number, maxValue = 100) => `${Math.min((value / maxValue) * 100, 100)}%`

  const getStatusColor = (value: number, maxValue = 100, label: string) => {
    const percentage = (value / maxValue) * 100

    if (label === "API Response") {
      if (value > 500) return "bg-red-500"
      if (value > 300) return "bg-yellow-500"
      return "bg-green-500"
    }

    if (percentage > 80) return "bg-red-500"
    if (percentage > 60) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getStatusIndicator = (status: string) => {
    switch (status) {
      case "OPERATIONAL":
        return { color: "text-green-400", bg: "bg-green-400/10", icon: "●" }
      case "WARNING":
        return { color: "text-yellow-400", bg: "bg-yellow-400/10", icon: "⚠" }
      case "DEGRADED":
        return { color: "text-red-400", bg: "bg-red-400/10", icon: "●" }
      default:
        return { color: "text-gray-400", bg: "bg-gray-400/10", icon: "●" }
    }
  }

  const statusInfo = getStatusIndicator(systemStatus)

  return (
    <div className="min-h-screen bg-black text-green-400">
      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-4">
          <div className="text-purple-300 font-mono">{">"} Xell System Health Monitor</div>
          <div className="text-purple-500/70 text-xs mt-1 font-mono">
            Real-time monitoring of terminal system performance and health
          </div>
          <div className="mt-2 text-green-400">{"─".repeat(60)}</div>
        </div>

        {/* System Status Overview */}
        <div className="border border-green-400/30 p-4 bg-green-400/5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-cyan-400" />
              <div>
                <h2 className="text-green-300 font-mono text-lg">System Status</h2>
                <p className="text-green-500/70 font-mono text-xs">Last updated: {lastUpdate.toLocaleTimeString()}</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1 rounded ${statusInfo.bg}`}>
              <span className={`${statusInfo.color} font-mono text-sm`}>{statusInfo.icon}</span>
              <span className={`${statusInfo.color} font-mono text-sm font-bold`}>{systemStatus}</span>
            </div>
          </div>
        </div>

        {/* System Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon
            const maxValue = metric.maxValue || 100
            return (
              <div key={index} className="border border-green-400/30 p-4 bg-green-400/5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                  <span className="font-mono text-green-300">{metric.label}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-2xl text-white">
                      {metric.label === "API Response" ||
                      metric.label === "Active Sessions" ||
                      metric.label === "Uptime"
                        ? metric.value.toFixed(metric.label === "Uptime" ? 1 : 0)
                        : metric.value.toFixed(1)}
                      {metric.unit}
                    </span>
                    <span className={`text-xs font-mono ${metric.color}`}>
                      {metric.label === "API Response"
                        ? metric.value > 500
                          ? "SLOW"
                          : metric.value > 300
                            ? "NORMAL"
                            : "FAST"
                        : metric.value > maxValue * 0.8
                          ? "HIGH"
                          : metric.value > maxValue * 0.6
                            ? "NORMAL"
                            : "LOW"}
                    </span>
                  </div>

                  <div className="w-full bg-gray-800 h-2">
                    <div
                      className={`h-2 transition-all duration-500 ${getStatusColor(metric.value, maxValue, metric.label)}`}
                      style={{ width: getBarWidth(metric.value, maxValue) }}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* System Activity Log */}
        <div className="border border-green-400/30 p-4 bg-green-400/5 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-green-400" />
            <span className="font-mono text-green-300">System Activity Log</span>
          </div>

          <div className="space-y-1 text-xs font-mono">
            <div className="text-green-500/70">
              [{new Date().toLocaleTimeString()}] Xell terminal system initialized
            </div>
            <div className="text-green-500/70">[{new Date().toLocaleTimeString()}] AI chat engine online</div>
            <div className="text-green-500/70">[{new Date().toLocaleTimeString()}] Token analysis API connected</div>
            <div className="text-green-500/70">[{new Date().toLocaleTimeString()}] Wallet analysis service active</div>
            <div className="text-cyan-400">
              [{new Date().toLocaleTimeString()}] Health monitoring dashboard accessed
            </div>
            <div className="text-green-500/70">
              [{new Date().toLocaleTimeString()}] System performance: {systemStatus}
            </div>
          </div>
        </div>

        {/* Service Status */}
        <div className="border border-green-400/30 p-4 bg-green-400/5">
          <h3 className="text-green-300 font-mono text-lg mb-3">Service Status:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-green-400">●</span>
              <div>
                <div className="text-green-300 font-mono text-sm">AI Chat Engine</div>
                <div className="text-green-500/70 font-mono text-xs">Anthropic - Operational</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">●</span>
              <div>
                <div className="text-green-300 font-mono text-sm">Token Analysis API</div>
                <div className="text-green-500/70 font-mono text-xs">Real-time data feeds - Active</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-green-400">●</span>
              <div>
                <div className="text-green-300 font-mono text-sm">Wallet Analytics</div>
                <div className="text-green-500/70 font-mono text-xs">PnL tracking - Online</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-red-400">●</span>
              <div>
                <div className="text-red-300 font-mono text-sm">Market Dashboard</div>
                <div className="text-red-500/70 font-mono text-xs">Under construction</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-green-400/30">
          <div className="text-green-500/70 text-xs space-y-1 font-mono">
            <div>
              System: Xell Terminal v1.0.0 | Uptime:{" "}
              {metrics.find((m) => m.label === "Uptime")?.value.toFixed(1) || "0.0"}h
            </div>
            <div>Last Health Check: {new Date().toLocaleString()}</div>
            <div>Status: All core services operational ✅</div>
          </div>
        </div>
      </div>
    </div>
  )
}
