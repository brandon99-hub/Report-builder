import type { InvoiceSchema } from "./validation"
import type { RDLModule } from "./modules"

export interface TemplateVersion {
  id: string
  name: string
  schema: InvoiceSchema
  templateId: string
  modules: RDLModule[]
  rdlXml: string
  timestamp: number
  description?: string
  tags?: string[]
}

export interface VersionHistory {
  projectId: string
  versions: TemplateVersion[]
  currentVersion: string
}

const STORAGE_KEY = "invoice_version_history"

// Save version to localStorage
export function saveVersion(version: TemplateVersion): void {
  try {
    const history = getVersionHistory(version.id.split("_")[0])
    history.versions.push(version)
    history.currentVersion = version.id
    localStorage.setItem(`${STORAGE_KEY}_${version.id.split("_")[0]}`, JSON.stringify(history))
  } catch (error) {
    console.error("Failed to save version:", error)
  }
}

// Get all versions for a project
export function getVersionHistory(projectId: string): VersionHistory {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}_${projectId}`)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load version history:", error)
  }

  return {
    projectId,
    versions: [],
    currentVersion: "",
  }
}

// Restore a specific version
export function restoreVersion(projectId: string, versionId: string): TemplateVersion | null {
  const history = getVersionHistory(projectId)
  const version = history.versions.find((v) => v.id === versionId)
  if (version) {
    history.currentVersion = versionId
    localStorage.setItem(`${STORAGE_KEY}_${projectId}`, JSON.stringify(history))
  }
  return version || null
}

// Delete a version
export function deleteVersion(projectId: string, versionId: string): void {
  const history = getVersionHistory(projectId)
  history.versions = history.versions.filter((v) => v.id !== versionId)
  if (history.currentVersion === versionId) {
    history.currentVersion = history.versions[history.versions.length - 1]?.id || ""
  }
  localStorage.setItem(`${STORAGE_KEY}_${projectId}`, JSON.stringify(history))
}

// Create version ID
export function createVersionId(projectId: string): string {
  return `${projectId}_v${Date.now()}`
}

// List all versions with metadata
export function listVersions(projectId: string): TemplateVersion[] {
  const history = getVersionHistory(projectId)
  return history.versions.sort((a, b) => b.timestamp - a.timestamp)
}
