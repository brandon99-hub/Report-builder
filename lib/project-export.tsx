import type { InvoiceSchema } from "./validation"
import type { RDLModule } from "./modules"
import type { CalculatedField } from "./formula-builder"

export interface ProjectExport {
  version: string
  timestamp: number
  schema: InvoiceSchema
  templateId: string
  modules?: RDLModule[]
  calculatedFields?: CalculatedField[]
  metadata?: {
    name?: string
    description?: string
  }
}

export function exportProject(data: {
  schema: InvoiceSchema
  templateId: string
  modules?: RDLModule[]
  calculatedFields?: CalculatedField[]
  metadata?: { name?: string; description?: string }
}): string {
  const exportData: ProjectExport = {
    version: "1.0",
    timestamp: Date.now(),
    schema: data.schema,
    templateId: data.templateId,
    modules: data.modules,
    calculatedFields: data.calculatedFields,
    metadata: data.metadata,
  }

  return JSON.stringify(exportData, null, 2)
}

export function importProject(jsonString: string): {
  success: boolean
  data?: ProjectExport
  error?: string
} {
  try {
    const data = JSON.parse(jsonString)

    // Validate structure
    if (!data || !data.schema || !data.templateId) {
      return {
        success: false,
        error: "Invalid project format: missing required fields",
      }
    }

    return {
      success: true,
      data: data as ProjectExport,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to parse project file",
    }
  }
}

