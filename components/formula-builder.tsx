"use client"

import { useState } from "react"
import { type CalculatedField, validateFormula, getFormulaContext } from "@/lib/formula-builder"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface FormulaBuilderProps {
  availableFields: string[]
  onAddField?: (field: CalculatedField) => void
}

export function FormulaBuilder({ availableFields, onAddField }: FormulaBuilderProps) {
  const [name, setName] = useState("")
  const [formula, setFormula] = useState("")
  const [dataType, setDataType] = useState<"currency" | "number" | "percentage">("number")
  const [error, setError] = useState("")
  const [formulaError, setFormulaError] = useState("")

  const context = getFormulaContext(availableFields)

  const handleAddField = () => {
    setError("")
    setFormulaError("")

    if (!name.trim()) {
      setError("Field name is required")
      return
    }

    const validation = validateFormula(formula)
    if (!validation.valid) {
      setFormulaError(validation.error || "Invalid formula")
      return
    }

    const newField: CalculatedField = {
      id: `field_${Date.now()}`,
      name,
      formula,
      dataType,
    }

    onAddField?.(newField)
    setName("")
    setFormula("")
    setDataType("number")
  }

  const insertFieldReference = (fieldName: string) => {
    const ref = `Fields!${fieldName}.Value`
    setFormula(formula + ref)
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Create Calculated Field</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Field Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., TaxAmount, DiscountedPrice"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Data Type</label>
            <select
              value={dataType}
              onChange={(e) => setDataType(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="number">Number</option>
              <option value="currency">Currency</option>
              <option value="percentage">Percentage</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">Formula (RDL Expression)</label>
            <textarea
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g., Fields!Quantity.Value * Fields!UnitPrice.Value"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              rows={4}
            />
            {formulaError && <p className="text-red-600 text-sm mt-2">{formulaError}</p>}
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">Available Fields:</p>
            <div className="flex flex-wrap gap-2">
              {availableFields.map((field) => (
                <button
                  key={field}
                  onClick={() => insertFieldReference(field)}
                  className="px-3 py-1 bg-slate-200 hover:bg-slate-300 rounded text-sm"
                >
                  {field}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-slate-900 mb-3">Functions:</p>
            <div className="grid grid-cols-1 gap-2">
              {context.functions.map((func) => (
                <div key={func.name} className="p-2 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p className="font-mono text-blue-900">{func.syntax}</p>
                  <p className="text-blue-700">{func.description}</p>
                </div>
              ))}
            </div>
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <Button onClick={handleAddField} className="w-full">
            Add Calculated Field
          </Button>
        </div>
      </Card>
    </div>
  )
}
