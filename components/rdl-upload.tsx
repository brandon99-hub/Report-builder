"use client"

import type React from "react"

import { useState } from "react"
import { parseRDL, type RDLParseError, type ParsedRDL } from "@/lib/rdl-parser"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface RDLUploadProps {
  onParsed?: (data: ParsedRDL) => void
  onBack?: () => void
}

export function RDLUpload({ onParsed, onBack }: RDLUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<RDLParseError[]>([])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleFile = async (file: File) => {
    if (!file.name.endsWith(".rdl") && !file.name.endsWith(".rdlc")) {
      setErrors([{ code: "INVALID_FILE", message: "Please upload an .rdl or .rdlc file" }])
      return
    }

    setIsLoading(true)
    setErrors([])

    try {
      const text = await file.text()
      const result = parseRDL(text)

      if (result.success && result.data) {
        onParsed?.(result.data)
      } else {
        const errorMessages = result.errors || [{ code: "UNKNOWN", message: "Failed to parse RDL" }]
        setErrors(errorMessages.map((err) => ({
          ...err,
          message: err.message + (err.line ? ` (Line ${err.line})` : ""),
        })))
      }
    } catch (error) {
      setErrors([{ code: "READ_ERROR", message: "Failed to read file" }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  return (
    <Card className="p-8">
      <div className="text-center">
        {onBack && (
          <div className="flex justify-start mb-4">
            <Button
              variant="ghost"
              onClick={onBack}
              className="-ml-2"
              aria-label="Go back to mode selection"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        )}
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Upload Existing RDL</h3>
        <p className="text-slate-600 mb-6">Import an existing invoice RDL file to parse and modify</p>

        <label
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 cursor-pointer transition ${
            isDragging ? "border-primary bg-primary/5" : "border-slate-300 hover:border-primary"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <div className="text-4xl">📄</div>
            <p className="font-semibold text-slate-900">Drag & drop your RDL file</p>
            <p className="text-sm text-slate-600">or click to browse</p>
            <input type="file" accept=".rdl,.rdlc" onChange={handleFileInput} disabled={isLoading} className="hidden" />
          </div>
        </label>

        {errors.length > 0 && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            {errors.map((error, idx) => (
              <p key={idx} className="text-red-800 text-sm">
                {error.message}
              </p>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">Parsing RDL file...</p>
          </div>
        )}
      </div>
    </Card>
  )
}
