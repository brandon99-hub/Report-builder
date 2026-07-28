"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { InvoiceForm } from "@/components/invoice-form"
import { GeneratedSuccess } from "@/components/generated-success"
import type { InvoiceSchema } from "@/lib/validation"
import type { RDLModule } from "@/lib/modules"
import type { CalculatedField } from "@/lib/formula-builder"
import { generateInvoiceNumber } from "@/lib/rdl-generator"
import { toast } from "sonner"

interface TemplateRecord {
  id: string
  name: string
  description?: string | null
  templateId: string
  schema: InvoiceSchema
  modules?: RDLModule[] | null
  calculatedFields?: CalculatedField[] | null
  rdlXml?: string | null
}

interface TemplateEditorProps {
  templateId: string
}

export function TemplateEditor({ templateId }: TemplateEditorProps) {
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [record, setRecord] = useState<TemplateRecord | null>(null)

  const [step, setStep] = useState<"form" | "generated">("form")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [schemaData, setSchemaData] = useState<InvoiceSchema | null>(null)
  const [generatedRdl, setGeneratedRdl] = useState<string>("")
  const [modules, setModules] = useState<RDLModule[]>([])
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/templates/${templateId}`)
        if (!res.ok) {
          const body = await res.json().catch(() => null)
          throw new Error(body?.error || "Failed to load template")
        }
        const data = (await res.json()) as TemplateRecord
        setRecord(data)
        setSelectedTemplate(data.templateId)
        setSchemaData(data.schema)
        setModules(data.modules || [])
        setCalculatedFields(data.calculatedFields || [])
        if (data.rdlXml) {
          setGeneratedRdl(data.rdlXml)
        }
        setStep("form")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load template")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [templateId])

  const handleFormSubmit = async (formData: InvoiceSchema) => {
    try {
      if (!formData.invoiceNumber && formData.invoiceItems && formData.invoiceItems.length > 0) {
        formData.invoiceNumber = generateInvoiceNumber()
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          invoiceSchema: formData,
          modules: modules.length > 0 ? modules : undefined,
          calculatedFields: calculatedFields.length > 0 ? calculatedFields : undefined,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const message =
          errorBody?.errors?.[0]?.message ||
          errorBody?.error ||
          "Failed to generate RDL. Please check your input and try again."
        throw new Error(message)
      }

      const body = await response.json()
      setGeneratedRdl(body.rdl)
      setSchemaData(formData)
      setStep("generated")
    } catch (error) {
      console.error("Generation failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate RDL")
    }
  }

  const handleDownloadRdl = () => {
    if (!generatedRdl) return
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/xml;charset=utf-8," + encodeURIComponent(generatedRdl))
    element.setAttribute("download", "Invoice.rdl")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleSaveChanges = async () => {
    if (!record || !schemaData) return
    try {
      const response = await fetch(`/api/templates/${record.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: record.name,
          description: record.description,
          schema: schemaData,
          templateId: selectedTemplate,
          modules: modules.length > 0 ? modules : null,
          calculatedFields: calculatedFields.length > 0 ? calculatedFields : null,
          rdlXml: generatedRdl || record.rdlXml || null,
        }),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => null)
        throw new Error(body?.error || "Failed to save template")
      }

      toast.success("Template saved")
      router.push("/dashboard")
    } catch (error) {
      console.error("Save failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save template")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading template...</p>
      </div>
    )
  }

  if (error || !record || !schemaData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600">{error || "Template not found"}</p>
        <button
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold"
          onClick={() => router.push("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-10 space-y-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500 mb-1">Editing template</p>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{record.name}</h1>
          </div>
          <button
            className="px-4 py-2 rounded-md border border-slate-300 text-sm font-semibold bg-white hover:bg-slate-50"
            onClick={() => router.push("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>

        {step === "form" && (
          <InvoiceForm
            templateId={selectedTemplate}
            onSubmit={handleFormSubmit}
            onBack={() => router.push("/dashboard")}
            initialData={schemaData}
          />
        )}

        {step === "generated" && (
          <GeneratedSuccess
            rdl={generatedRdl}
            schemaData={schemaData}
            templateId={selectedTemplate}
            modules={modules}
            onDownload={handleDownloadRdl}
            onReset={() => setStep("form")}
            onBack={() => setStep("form")}
            onSaveVersion={undefined}
          />
        )}
      </div>
    </main>
  )
}


