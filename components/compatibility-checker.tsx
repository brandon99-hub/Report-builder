"use client"

import { useState } from "react"
import {
  checkBCCompatibility,
  generateCompatibilityReport,
  type CompatibilityIssue,
} from "@/lib/bc-compatibility-checker"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface CompatibilityCheckerProps {
  rdlXml: string
}

export function CompatibilityChecker({ rdlXml }: CompatibilityCheckerProps) {
  const [issues, setIssues] = useState<CompatibilityIssue[]>([])
  const [hasChecked, setHasChecked] = useState(false)

  const handleCheck = () => {
    const foundIssues = checkBCCompatibility(rdlXml)
    setIssues(foundIssues)
    setHasChecked(true)
  }

  const handleDownloadReport = () => {
    const report = generateCompatibilityReport(issues)
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(report))
    element.setAttribute("download", "bc-compatibility-report.txt")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const errorCount = issues.filter((i) => i.severity === "error").length
  const warningCount = issues.filter((i) => i.severity === "warning").length
  const infoCount = issues.filter((i) => i.severity === "info").length

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Business Central Compatibility Check</h3>

      {!hasChecked ? (
        <div className="text-center py-8">
          <p className="text-slate-600 mb-4">Check if your RDL report is compatible with Business Central</p>
          <Button onClick={handleCheck}>Run Compatibility Check</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              <p className="text-sm text-red-700">Errors</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">{warningCount}</p>
              <p className="text-sm text-yellow-700">Warnings</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{infoCount}</p>
              <p className="text-sm text-blue-700">Info</p>
            </div>
          </div>

          {issues.length > 0 && (
            <div className="space-y-2">
              {issues.map((issue, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    issue.severity === "error"
                      ? "bg-red-50 border-red-200"
                      : issue.severity === "warning"
                        ? "bg-yellow-50 border-yellow-200"
                        : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <p className="font-semibold text-sm">
                    [{issue.code}] {issue.message}
                  </p>
                  {issue.suggestion && <p className="text-sm mt-1">💡 {issue.suggestion}</p>}
                </div>
              ))}
            </div>
          )}

          {issues.length === 0 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <p className="text-green-700 font-semibold">All checks passed!</p>
            </div>
          )}

          <Button onClick={handleDownloadReport} variant="outline" className="w-full bg-transparent">
            Download Report
          </Button>
        </div>
      )}
    </Card>
  )
}
