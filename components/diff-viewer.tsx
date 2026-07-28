"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { type TemplateVersion } from "@/lib/version-history"

interface DiffViewerProps {
  version1: TemplateVersion
  version2: TemplateVersion
  onClose: () => void
}

export function DiffViewer({ version1, version2, onClose }: DiffViewerProps) {
  const [viewMode, setViewMode] = useState<"schema" | "rdl">("schema")

  const getSchemaDiff = () => {
    const v1Schema = JSON.stringify(version1.schema, null, 2)
    const v2Schema = JSON.stringify(version2.schema, null, 2)
    return { v1: v1Schema, v2: v2Schema }
  }

  const getRDLDiff = () => {
    return { v1: version1.rdlXml, v2: version2.rdlXml }
  }

  const diff = viewMode === "schema" ? getSchemaDiff() : getRDLDiff()

  // Simple diff highlighting (basic implementation)
  const highlightDiff = (text1: string, text2: string) => {
    const lines1 = text1.split("\n")
    const lines2 = text2.split("\n")
    const maxLines = Math.max(lines1.length, lines2.length)

    return {
      lines1: lines1.map((line, idx) => {
        const line2 = lines2[idx]
        if (line !== line2) {
          return { text: line, changed: true }
        }
        return { text: line, changed: false }
      }),
      lines2: lines2.map((line, idx) => {
        const line1 = lines1[idx]
        if (line !== line1) {
          return { text: line, changed: true }
        }
        return { text: line, changed: false }
      }),
    }
  }

  const diffResult = highlightDiff(diff.v1, diff.v2)

  return (
    <Card className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Version Comparison</h3>
        <Button variant="outline" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <Button
          variant={viewMode === "schema" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("schema")}
        >
          Schema Diff
        </Button>
        <Button
          variant={viewMode === "rdl" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("rdl")}
        >
          RDL Diff
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="bg-blue-50 p-2 rounded-t-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900">
              {version1.name} ({new Date(version1.timestamp).toLocaleString()})
            </p>
          </div>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-b-lg overflow-auto max-h-96 font-mono text-xs border border-blue-200 border-t-0">
            <pre>
              {diffResult.lines1.map((line, idx) => (
                <div
                  key={idx}
                  className={line.changed ? "bg-red-900/50 text-red-200" : ""}
                >
                  {line.text || " "}
                </div>
              ))}
            </pre>
          </div>
        </div>

        <div>
          <div className="bg-green-50 p-2 rounded-t-lg border border-green-200">
            <p className="text-sm font-semibold text-green-900">
              {version2.name} ({new Date(version2.timestamp).toLocaleString()})
            </p>
          </div>
          <div className="bg-slate-900 text-slate-100 p-4 rounded-b-lg overflow-auto max-h-96 font-mono text-xs border border-green-200 border-t-0">
            <pre>
              {diffResult.lines2.map((line, idx) => (
                <div
                  key={idx}
                  className={line.changed ? "bg-green-900/50 text-green-200" : ""}
                >
                  {line.text || " "}
                </div>
              ))}
            </pre>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm">
        <p className="font-semibold mb-1">Legend:</p>
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-900/50"></div>
            <span>Removed/Changed in Version 1</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-900/50"></div>
            <span>Added/Changed in Version 2</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

