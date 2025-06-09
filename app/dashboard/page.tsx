"use client"

import { useEffect, useState } from "react"

interface Run {
  id: string
  project_id: string
  user_id: string
  status: string
  started_at: string
  completed_at: string | null
  run_type: string
  total_files: number
  processed_files: number
  error_count: number
  success_rate: number
  created_at: string
}

const DashboardPage = () => {
  const [runs, setRuns] = useState<Run[]>([])

  useEffect(() => {
    const fetchRuns = async () => {
      try {
        const response = await fetch("/api/runs")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        setRuns(data)
      } catch (error) {
        console.error("Failed to fetch runs:", error)
      }
    }

    fetchRuns()
  }, [])

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      {runs.length > 0 ? (
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Project ID</th>
              <th className="px-4 py-2">User ID</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Started At</th>
              <th className="px-4 py-2">Completed At</th>
              <th className="px-4 py-2">Run Type</th>
              <th className="px-4 py-2">Total Files</th>
              <th className="px-4 py-2">Processed Files</th>
              <th className="px-4 py-2">Error Count</th>
              <th className="px-4 py-2">Success Rate</th>
              <th className="px-4 py-2">Created At</th>
            </tr>
          </thead>
          <tbody>
            {runs.map((run) => (
              <tr key={run.id}>
                <td className="border px-4 py-2">{run.id}</td>
                <td className="border px-4 py-2">{run.project_id}</td>
                <td className="border px-4 py-2">{run.user_id}</td>
                <td className="border px-4 py-2">{run.status}</td>
                <td className="border px-4 py-2">{run.started_at}</td>
                <td className="border px-4 py-2">{run.completed_at}</td>
                <td className="border px-4 py-2">{run.run_type}</td>
                <td className="border px-4 py-2">{run.total_files}</td>
                <td className="border px-4 py-2">{run.processed_files}</td>
                <td className="border px-4 py-2">{run.error_count}</td>
                <td className="border px-4 py-2">{run.success_rate}</td>
                <td className="border px-4 py-2">{run.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No runs found.</p>
      )}
    </div>
  )
}

export default DashboardPage
