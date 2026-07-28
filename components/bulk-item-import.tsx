"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Upload, FileText, X, ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { toast } from "sonner"

interface InvoiceItem {
  description: string
  quantity: string
  price: string
  amount: string
}

interface BulkItemImportProps {
  onImport: (items: InvoiceItem[]) => void
  onClose: () => void
}

const CSV_EXAMPLE = `Description, Quantity, Price, Amount
Product A, 2, 50.00, 100.00
Product B, 1, 75.00, 75.00
Service C, 3, 30.00, 90.00`

export function BulkItemImport({ onImport, onClose }: BulkItemImportProps) {
  const [csvText, setCsvText] = useState("")
  const [previewItems, setPreviewItems] = useState<InvoiceItem[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [showExamples, setShowExamples] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const parseCSV = (text: string): InvoiceItem[] => {
    const lines = text.trim().split("\n")
    if (lines.length === 0) return []

    // Try to detect if first line is header
    const hasHeader = lines[0].toLowerCase().includes("description") || 
                      lines[0].toLowerCase().includes("quantity") ||
                      lines[0].toLowerCase().includes("price")

    const dataLines = hasHeader ? lines.slice(1) : lines
    const items: InvoiceItem[] = []

    dataLines.forEach((line) => {
      // Handle CSV with commas or tabs
      const values = line.includes("\t") 
        ? line.split("\t") 
        : line.split(",").map(v => v.trim().replace(/^"|"$/g, ""))

      if (values.length >= 3) {
        const description = values[0]?.trim() || ""
        const quantity = values[1]?.trim() || "1"
        const price = values[2]?.trim() || "0"
        const amount = values[3]?.trim() || (parseFloat(quantity) * parseFloat(price)).toFixed(2)

        if (description) {
          items.push({
            description,
            quantity,
            price,
            amount,
          })
        }
      }
    })

    return items
  }

  const handleFileUpload = (file: File) => {
    if (!file.name.match(/\.(csv|txt)$/i)) {
      toast.error("Please upload a CSV or TXT file")
      return
    }

    setIsLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setCsvText(text)
      const items = parseCSV(text)
      setPreviewItems(items)
      setIsLoading(false)
      if (items.length === 0) {
        toast.warning("No valid items found in the file")
      } else {
        toast.success(`Found ${items.length} items`)
      }
    }
    reader.onerror = () => {
      setIsLoading(false)
      toast.error("Failed to read file")
    }
    reader.readAsText(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleTextChange = (text: string) => {
    setCsvText(text)
    const items = parseCSV(text)
    setPreviewItems(items)
  }

  const handleCopyExample = () => {
    navigator.clipboard.writeText(CSV_EXAMPLE)
    setCopied(true)
    toast.success("Example copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const calculateTotal = () => {
    return previewItems.reduce((sum, item) => {
      return sum + (parseFloat(item.amount) || 0)
    }, 0).toFixed(2)
  }

  const handleImport = () => {
    if (previewItems.length === 0) {
      toast.error("No items to import")
      return
    }
    onImport(previewItems)
    toast.success(`Imported ${previewItems.length} items`)
    onClose()
  }

  const handleClear = () => {
    setCsvText("")
    setPreviewItems([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Card className="w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Bulk Import Invoice Items</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Upload a CSV file or paste CSV data to import multiple items at once
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="flex-shrink-0">
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6">
        <div className="py-6 space-y-6">
          {/* Step 1: File Upload */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">1</div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Upload CSV File</h4>
            </div>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-slate-300 dark:border-slate-700"
              } ${isLoading ? "opacity-50 pointer-events-none" : ""}`}
            >
              {isLoading ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-slate-600 dark:text-slate-400">Processing file...</p>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Drag and drop a CSV file here, or</p>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="mb-2"
                    disabled={isLoading}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Choose File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400">CSV or TXT files only</p>
                </>
              )}
            </div>
          </div>

          {/* Step 2: Paste CSV */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">2</div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Or Paste CSV Data</h4>
            </div>
            <textarea
              value={csvText}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={CSV_EXAMPLE}
              className="w-full h-40 p-3 border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-sm bg-background resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Format Examples - Collapsible */}
          <Collapsible open={showExamples} onOpenChange={setShowExamples}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="text-sm font-medium">Format Examples</span>
                {showExamples ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <Card className="p-4 bg-slate-50 dark:bg-slate-900">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">CSV Format:</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Description, Quantity, Price, Amount (optional)</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyExample}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <pre className="text-xs font-mono bg-white dark:bg-slate-800 p-3 rounded border overflow-x-auto">
                  {CSV_EXAMPLE}
                </pre>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Step 3: Preview */}
          {previewItems.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">3</div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Preview ({previewItems.length} items)
                </h4>
                <div className="ml-auto text-sm text-slate-600 dark:text-slate-400">
                  Total: <span className="font-semibold text-slate-900 dark:text-white">{calculateTotal()}</span>
                </div>
              </div>
              <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
                <ScrollArea className="h-[300px]">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 border-b">
                      <tr>
                        <th className="p-3 text-left font-semibold text-slate-900 dark:text-white">Description</th>
                        <th className="p-3 text-right font-semibold text-slate-900 dark:text-white">Quantity</th>
                        <th className="p-3 text-right font-semibold text-slate-900 dark:text-white">Price</th>
                        <th className="p-3 text-right font-semibold text-slate-900 dark:text-white">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewItems.map((item, idx) => (
                        <tr 
                          key={idx} 
                          className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="p-3 text-slate-900 dark:text-white">{item.description}</td>
                          <td className="p-3 text-right text-slate-700 dark:text-slate-300">{item.quantity}</td>
                          <td className="p-3 text-right text-slate-700 dark:text-slate-300">{item.price}</td>
                          <td className="p-3 text-right font-medium text-slate-900 dark:text-white">{item.amount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollArea>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="flex items-center justify-between gap-3 p-6 border-t flex-shrink-0 bg-slate-50 dark:bg-slate-900">
        <Button variant="outline" onClick={handleClear} disabled={previewItems.length === 0 && !csvText}>
          Clear
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={previewItems.length === 0 || isLoading}
            className="min-w-[140px]"
          >
            Import {previewItems.length > 0 ? `${previewItems.length} ` : ""}Items
          </Button>
        </div>
      </div>
    </Card>
  )
}
