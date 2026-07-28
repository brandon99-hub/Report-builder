"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { AVAILABLE_INVOICE_COLUMNS } from "@/lib/types/invoice"
import type { ItemColumn } from "@/lib/types/invoice"

interface ColumnSelectorProps {
    selectedColumns: string[]
    onChange: (columns: string[]) => void
}

export function ColumnSelector({ selectedColumns, onChange }: ColumnSelectorProps) {
    const toggleColumn = (fieldName: string) => {
        if (selectedColumns.includes(fieldName)) {
            onChange(selectedColumns.filter(col => col !== fieldName))
        } else {
            onChange([...selectedColumns, fieldName])
        }
    }

    const essentialColumns = ['description', 'quantity', 'unitPrice', 'lineTotal']
    const optionalColumns = AVAILABLE_INVOICE_COLUMNS.filter(
        col => !essentialColumns.includes(col.fieldName)
    )

    return (
        <Card className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 border-2">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                            Invoice Columns
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Choose which columns to display in your invoice
                        </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                        {selectedColumns.length} selected
                    </Badge>
                </div>

                {/* Essential Columns */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Essential Columns (Always Visible)
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {AVAILABLE_INVOICE_COLUMNS
                            .filter(col => essentialColumns.includes(col.fieldName))
                            .map((column) => (
                                <div
                                    key={column.fieldName}
                                    className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                                >
                                    <Label htmlFor={column.fieldName} className="text-sm font-medium cursor-not-allowed opacity-75">
                                        {column.label}
                                    </Label>
                                    <Switch
                                        id={column.fieldName}
                                        checked={true}
                                        disabled={true}
                                        className="opacity-50"
                                    />
                                </div>
                            ))}
                    </div>
                </div>

                {/* Optional Columns */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Optional Columns
                    </Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {optionalColumns.map((column) => {
                            const isSelected = selectedColumns.includes(column.fieldName)
                            return (
                                <div
                                    key={column.fieldName}
                                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${isSelected
                                            ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                        }`}
                                >
                                    <Label
                                        htmlFor={column.fieldName}
                                        className="text-sm font-medium cursor-pointer flex-1"
                                    >
                                        {column.label}
                                    </Label>
                                    <Switch
                                        id={column.fieldName}
                                        checked={isSelected}
                                        onCheckedChange={() => toggleColumn(column.fieldName)}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Column Preview */}
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <Label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                        Column Order Preview
                    </Label>
                    <div className="flex flex-wrap gap-2">
                        {AVAILABLE_INVOICE_COLUMNS
                            .filter(col =>
                                essentialColumns.includes(col.fieldName) ||
                                selectedColumns.includes(col.fieldName)
                            )
                            .map((column, index) => (
                                <Badge
                                    key={column.fieldName}
                                    variant={essentialColumns.includes(column.fieldName) ? "default" : "secondary"}
                                    className="text-xs"
                                >
                                    {index + 1}. {column.label}
                                </Badge>
                            ))}
                    </div>
                </div>
            </div>
        </Card>
    )
}
