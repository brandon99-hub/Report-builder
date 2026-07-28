"use client"

import { useState } from "react"
import { type RDLModule, DEFAULT_MODULES, updateModuleState } from "@/lib/modules"
import { Card } from "@/components/ui/card"

interface ModuleSelectorProps {
  onChange?: (modules: RDLModule[]) => void
}

export function ModuleSelector({ onChange }: ModuleSelectorProps) {
  const [modules, setModules] = useState<RDLModule[]>(DEFAULT_MODULES)

  const handleToggle = (moduleId: string) => {
    const updated = updateModuleState(modules, moduleId, !modules.find((m) => m.id === moduleId)?.enabled)
    setModules(updated)
    onChange?.(updated)
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Invoice Template Modules</h3>
      <p className="text-sm text-slate-600 mb-6">Select which sections to include in your invoice</p>

      <div className="space-y-3">
        {modules.map((module) => (
          <label
            key={module.id}
            className="flex items-center p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={module.enabled}
              onChange={() => handleToggle(module.id)}
              className="w-4 h-4 rounded border-slate-300 text-primary"
              aria-label={`Toggle ${module.name} module`}
              aria-describedby={`module-desc-${module.id}`}
            />
            <div className="ml-3 flex-1">
              <p className="font-semibold text-slate-900">{module.name}</p>
              <p id={`module-desc-${module.id}`} className="text-xs text-slate-600">{module.description}</p>
            </div>
          </label>
        ))}
      </div>
    </Card>
  )
}
