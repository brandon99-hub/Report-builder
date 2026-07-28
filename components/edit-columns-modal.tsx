"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { GripVertical } from "lucide-react"

interface Column {
  label: string
  fieldName: string
}

interface EditColumnsModalProps {
  mode: "columns" | "totals"
  data: Column[]
  onSave: (data: Column[]) => void
  onClose: () => void
}

export function EditColumnsModal({ mode, data, onSave, onClose }: EditColumnsModalProps) {
  const [columns, setColumns] = useState<Column[]>(data)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      setDragOverIndex(null)
      return
    }

    const newColumns = [...columns]
    const draggedItem = newColumns[draggedIndex]
    newColumns.splice(draggedIndex, 1)
    newColumns.splice(dropIndex, 0, draggedItem)
    setColumns(newColumns)
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
    setDragOverIndex(null)
  }

  return (
    <>
      {/* Animated backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 opacity-0 animate-in fade-in duration-200"
        onClick={onClose}
        aria-label="Close modal"
      />

      {/* Modal container */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <Card className="w-full max-w-lg border-2 shadow-2xl pointer-events-auto scale-95 animate-in zoom-in-95 fade-in duration-300">
          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                Edit {mode === "columns" ? "Item Columns" : "Totals"}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {mode === "columns"
                  ? "Customize the columns that appear in your invoice items table"
                  : "Configure the summary fields at the bottom of your invoice"}
              </p>
            </div>

            {/* Items list with scroll */}
            <div className="space-y-3 max-h-72 overflow-y-auto mb-6 pr-2">
              {columns.map((col, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 bg-gradient-to-r from-muted/50 to-transparent rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 space-y-3 cursor-move ${
                    draggedIndex === idx ? "opacity-50" : ""
                  } ${
                    dragOverIndex === idx ? "border-primary border-2 scale-105" : ""
                  }`}
                >
                  {/* Drag handle */}
                  <div className="flex items-center gap-2 mb-2">
                    <GripVertical className="w-5 h-5 text-slate-400 cursor-grab active:cursor-grabbing" />
                    <span className="text-xs text-slate-500 font-medium">Drag to reorder</span>
                  </div>
                  {/* Label input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
                      Display Label
                    </label>
                    <Input
                      placeholder="e.g., Description"
                      value={col.label}
                      onChange={(e) => {
                        const updated = [...columns]
                        updated[idx].label = e.target.value
                        setColumns(updated)
                      }}
                      className="text-sm h-9"
                    />
                  </div>

                  {/* Field name input */}
                  <div>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 block">
                      Field Name
                    </label>
                    <Input
                      placeholder="e.g., Description"
                      value={col.fieldName}
                      onChange={(e) => {
                        const updated = [...columns]
                        updated[idx].fieldName = e.target.value
                        setColumns(updated)
                      }}
                      className="text-sm font-mono h-9"
                    />
                  </div>

                  {/* Remove button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setColumns(columns.filter((_, i) => i !== idx))}
                    className="w-full text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/50 transition-all"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            {/* Add new button */}
            <Button
              variant="outline"
              onClick={() => setColumns([...columns, { label: "", fieldName: "" }])}
              className="w-full mb-6 h-10 border-dashed border-primary/50 hover:bg-primary/5 text-primary transition-all"
            >
              + Add {mode === "columns" ? "Column" : "Total"}
            </Button>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent h-10 transition-all hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                onClick={() => onSave(columns)}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 transition-all active:scale-95"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
