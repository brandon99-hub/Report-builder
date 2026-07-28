"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Editor from "react-simple-code-editor"
import { highlight, languages } from "prismjs"
import "prismjs/components/prism-markup"
import "prismjs/themes/prism-tomorrow.css"
import { validateRDLXml, type ValidationError } from "@/lib/xml-validator"
import { toast } from "sonner"

interface DeveloperModeProps {
  rdlXml: string
  onRdlChange?: (xml: string) => void
}

export function DeveloperMode({ rdlXml, onRdlChange }: DeveloperModeProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedXml, setEditedXml] = useState(rdlXml)
  const [isCopied, setIsCopied] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showValidation, setShowValidation] = useState(false)

  const handleSave = () => {
    onRdlChange?.(editedXml)
    setIsEditing(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(editedXml)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  const handleFormat = () => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(editedXml, "text/xml")
      // Simple formatting (more sophisticated formatting could be added)
      const serializer = new XMLSerializer()
      const formatted = serializer.serializeToString(xmlDoc)
      setEditedXml(formatted)
      toast.success("XML formatted")
    } catch (error) {
      toast.error("Invalid XML format")
    }
  }

  const handleValidate = () => {
    const errors = validateRDLXml(editedXml)
    setValidationErrors(errors)
    setShowValidation(true)
    
    const errorCount = errors.filter((e) => e.severity === "error").length
    const warningCount = errors.filter((e) => e.severity === "warning").length
    
    if (errorCount === 0 && warningCount === 0) {
      toast.success("✓ No validation errors found")
    } else {
      toast.warning(`Found ${errorCount} errors and ${warningCount} warnings`)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900">Developer Mode - XML Editor</h3>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleValidate}>
                Validate
              </Button>
              <Button variant="outline" size="sm" onClick={handleFormat}>
                Format XML
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {isCopied ? "Copied!" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={handleValidate}>
                Validate
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit XML
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <Editor
            value={editedXml}
            onValueChange={setEditedXml}
            highlight={(code) => highlight(code, languages.markup, "markup")}
            padding={12}
            style={{
              fontFamily: '"Fira Code", "Fira Mono", monospace',
              fontSize: 13,
              backgroundColor: "#1e293b",
              color: "#e2e8f0",
              minHeight: "384px",
              maxHeight: "600px",
              overflow: "auto",
            }}
            textareaClassName="outline-none"
            preClassName="language-markup"
          />
        </div>
      ) : (
        <div className="border border-slate-300 rounded-lg overflow-hidden">
          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-auto max-h-96 font-mono text-sm">
            <code
              dangerouslySetInnerHTML={{
                __html: highlight(editedXml, languages.markup, "markup"),
              }}
            />
          </pre>
        </div>
      )}

      {showValidation && validationErrors.length > 0 && (
        <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
          {validationErrors.map((error, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg text-sm ${
                error.severity === "error"
                  ? "bg-red-50 border border-red-200 text-red-800"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-800"
              }`}
            >
              <div className="font-semibold">
                [{error.severity.toUpperCase()}]
                {error.line && ` Line ${error.line}`}
              </div>
              <div className="mt-1">{error.message}</div>
              {error.suggestion && (
                <div className="mt-1 text-xs opacity-80">💡 {error.suggestion}</div>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-600 mt-3">
        For advanced users: Edit the RDL XML directly. Be careful with manual edits - ensure XML remains valid.
      </p>
    </Card>
  )
}
