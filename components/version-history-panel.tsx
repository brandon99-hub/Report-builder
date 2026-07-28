"use client"

import { useState, useEffect } from "react"
import { type TemplateVersion, restoreVersion, deleteVersion, listVersions } from "@/lib/version-history"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog"
import { DiffViewer } from "./diff-viewer"

interface VersionHistoryPanelProps {
  projectId: string
  onRestore?: (version: TemplateVersion) => void
}

export function VersionHistoryPanel({ projectId, onRestore }: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<TemplateVersion[]>([])
  const [selectedVersion, setSelectedVersion] = useState<string>("")
  const [showDiff, setShowDiff] = useState(false)
  const [diffVersions, setDiffVersions] = useState<{ v1?: TemplateVersion; v2?: TemplateVersion }>({})
  const [versionToDelete, setVersionToDelete] = useState<TemplateVersion | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    loadVersions()
  }, [projectId])

  const loadVersions = () => {
    const allVersions = listVersions(projectId)
    setVersions(allVersions)
    if (allVersions.length > 0) {
      setSelectedVersion(allVersions[0].id)
    }
  }

  const handleRestore = () => {
    if (!selectedVersion) return
    const version = restoreVersion(projectId, selectedVersion)
    if (version) {
      onRestore?.(version)
    }
  }

  const handleDelete = (versionId: string) => {
    const version = versions.find((v) => v.id === versionId) || null
    setVersionToDelete(version)
    setIsDeleteDialogOpen(true)
  }

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Version History</h3>

      {versions.length === 0 ? (
        <p className="text-slate-600 text-sm">No versions saved yet</p>
      ) : (
        <div className="space-y-2">
          {versions.map((version) => (
            <div
              key={version.id}
              className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{version.name}</p>
                <p className="text-xs text-slate-600">{formatDate(version.timestamp)}</p>
                {version.description && <p className="text-sm text-slate-700">{version.description}</p>}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (versions.length >= 2) {
                      const currentIdx = versions.findIndex((v) => v.id === version.id)
                      const prevVersion = versions[currentIdx + 1] || versions[0]
                      setDiffVersions({ v1: prevVersion, v2: version })
                      setShowDiff(true)
                    }
                  }}
                  disabled={versions.length < 2}
                  title="Compare with previous version"
                >
                  Compare
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedVersion(version.id)
                    handleRestore()
                  }}
                >
                  Restore
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(version.id)} className="text-red-600">
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showDiff && diffVersions.v1 && diffVersions.v2 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-auto">
          <DiffViewer
            version1={diffVersions.v1}
            version2={diffVersions.v2}
            onClose={() => {
              setShowDiff(false)
              setDiffVersions({})
            }}
          />
        </div>
      )}

      {/* Delete version confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete version?</AlertDialogTitle>
            <AlertDialogDescription>
              {versionToDelete
                ? `This will permanently delete "${versionToDelete.name}" from version history. This action cannot be undone.`
                : "This will permanently delete the selected version from history. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setVersionToDelete(null)
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (versionToDelete) {
                  deleteVersion(projectId, versionToDelete.id)
                  loadVersions()
                }
                setVersionToDelete(null)
                setIsDeleteDialogOpen(false)
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
