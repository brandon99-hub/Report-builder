"use client"

import { useState } from "react"
import { InvoiceForm } from "@/components/invoice-form"
import { TemplateSelector } from "@/components/template-selector"
import { TemplateGallery } from "@/components/template-gallery"
import { StepIndicator } from "@/components/step-indicator"
import { GeneratedSuccess } from "@/components/generated-success"
import { RDLUpload } from "@/components/rdl-upload"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ModuleSelector } from "@/components/module-selector"
import { FormulaBuilder } from "@/components/formula-builder"
import { lazy, Suspense } from "react"
import { DeveloperMode } from "@/components/developer-mode"
import { CompatibilityChecker } from "@/components/compatibility-checker"
import { VersionHistoryPanel } from "@/components/version-history-panel"
import { importProject } from "@/lib/project-export"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { BCDeployment } from "@/components/bc-deployment"
import type { InvoiceSchema } from "@/lib/validation"
import type { RDLModule } from "@/lib/modules"
import type { CalculatedField } from "@/lib/formula-builder"
import type { ParsedRDL } from "@/lib/rdl-parser"
import { generateInvoiceNumber } from "@/lib/rdl-generator"

export default function Home() {
  const [step, setStep] = useState<"mode" | "template" | "form" | "generated" | "upload">("mode")
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [galleryTemplateId, setGalleryTemplateId] = useState<string | null>(null)
  const [schemaData, setSchemaData] = useState<InvoiceSchema | null>(null)
  const [generatedRdl, setGeneratedRdl] = useState<string>("")
  const [mode, setMode] = useState<"create" | "upload">("create")
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [calculatedFields, setCalculatedFields] = useState<CalculatedField[]>([])
  const [selectedTheme, setSelectedTheme] = useState("professional")
  const [selectedModules, setSelectedModules] = useState<RDLModule[]>([])
  const [formKey, setFormKey] = useState(0)
  const [showGallery, setShowGallery] = useState(false)

  const handleModeSelect = (selectedMode: "create" | "upload") => {
    setMode(selectedMode)
    if (selectedMode === "create") {
      setStep("template")
    } else {
      setStep("upload")
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId)
    setStep("form")
  }

  const handleFormSubmit = async (formData: InvoiceSchema) => {
    try {
      // Generate invoice number on client side if we have invoice items and none is set
      if (!formData.invoiceNumber && formData.invoiceItems && formData.invoiceItems.length > 0) {
        formData.invoiceNumber = generateInvoiceNumber()
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate,
          invoiceSchema: formData,
          modules: selectedModules.length > 0 ? selectedModules : undefined,
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
      alert(error instanceof Error ? error.message : "Failed to generate RDL. Please try again.")
    }
  }

  const handleRDLParsed = (parsedData: ParsedRDL) => {
    setSelectedTemplate("modern")
    setSchemaData(parsedData.schema)
    setStep("form")
  }

  const handleDownload = () => {
    const element = document.createElement("a")
    element.setAttribute("href", "data:text/xml;charset=utf-8," + encodeURIComponent(generatedRdl))
    element.setAttribute("download", "Invoice.rdl")
    element.style.display = "none"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleReset = () => {
    setStep("mode")
    setSelectedTemplate("")
    setSchemaData(null)
    setGeneratedRdl("")
    setMode("create")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-16">
          <div className="mb-12 text-center">
            {/* Logo badge */}
            <div className="inline-flex items-center justify-center mb-6">
              <div className="relative w-14 h-14 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-lg flex items-center justify-center transform -rotate-12">
                <div className="text-white text-2xl font-bold">📋</div>
              </div>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl font-bold text-balance bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-4">
              Invoice Report Builder
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-slate-600 dark:text-slate-400 text-pretty max-w-2xl mx-auto mb-2">
              Create professional invoice templates for Business Central and SSRS
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">Powered by RDL Report Definition Language</p>
          </div>

          {step !== "mode" && (
            <StepIndicator currentStep={step === "template" ? 1 : step === "form" ? 2 : 3} totalSteps={3} />
          )}
        </div>

        {step === "mode" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 max-w-4xl mx-auto px-4">
            <Card
              className="p-8 text-center cursor-pointer hover:shadow-lg transition"
              onClick={() => handleModeSelect("create")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleModeSelect("create")
                }
              }}
              aria-label="Create new invoice template"
            >
              <div className="text-4xl mb-3">✨</div>
              <h3 className="text-xl font-bold mb-2">Create New</h3>
              <p className="text-slate-600">Build invoice from scratch</p>
            </Card>
            <Card
              className="p-8 text-center cursor-pointer hover:shadow-lg transition"
              onClick={() => handleModeSelect("upload")}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  handleModeSelect("upload")
                }
              }}
              aria-label="Upload existing RDL file"
            >
              <div className="text-4xl mb-3">📂</div>
              <h3 className="text-xl font-bold mb-2">Upload Existing</h3>
              <p className="text-slate-600">Import and modify RDL</p>
            </Card>
            <Card
              className="p-8 text-center cursor-pointer hover:shadow-lg transition"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault()
                  const input = document.createElement("input")
                  input.type = "file"
                  input.accept = ".json"
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (event) => {
                        const result = importProject(event.target?.result as string)
                        if (result.success && result.data) {
                          setSchemaData(result.data.schema)
                          setSelectedTemplate(result.data.templateId)
                          if (result.data.modules) {
                            setSelectedModules(result.data.modules)
                          }
                          if (result.data.calculatedFields) {
                            setCalculatedFields(result.data.calculatedFields)
                          }
                          setStep("form")
                        } else {
                          alert(result.error || "Failed to import project")
                        }
                      }
                      reader.readAsText(file)
                    }
                  }
                  input.click()
                }
              }}
              onClick={() => {
                const input = document.createElement("input")
                input.type = "file"
                input.accept = ".json"
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const result = importProject(event.target?.result as string)
                      if (result.success && result.data) {
                        setSchemaData(result.data.schema)
                        setSelectedTemplate(result.data.templateId)
                        if (result.data.modules) {
                          setSelectedModules(result.data.modules)
                        }
                        if (result.data.calculatedFields) {
                          setCalculatedFields(result.data.calculatedFields)
                        }
                        setStep("form")
                      } else {
                        alert(result.error || "Failed to import project")
                      }
                    }
                    reader.readAsText(file)
                  }
                }
                input.click()
              }}
            >
              <div className="text-4xl mb-3">📥</div>
              <h3 className="text-xl font-bold mb-2">Import Project</h3>
              <p className="text-slate-600">Load saved project</p>
            </Card>
          </div>
        )}

        {step === "upload" && (
          <RDLUpload
            onParsed={handleRDLParsed}
            onBack={() => setStep("mode")}
          />
        )}

        {step === "template" && (
          <div className="space-y-6">
            {/* Toggle between basic templates and gallery */}
            <div className="flex justify-center gap-4">
              <Button
                variant={!showGallery ? "default" : "outline"}
                onClick={() => setShowGallery(false)}
              >
                Basic Templates
              </Button>
              <Button
                variant={showGallery ? "default" : "outline"}
                onClick={() => setShowGallery(true)}
              >
                Template Gallery
              </Button>
            </div>

            {!showGallery ? (
              <TemplateSelector
                onSelect={handleTemplateSelect}
                onBack={() => setStep("mode")}
              />
            ) : (
              <TemplateGallery
                onSelectTemplate={(template) => {
                  // Store gallery template ID for preview styling
                  setGalleryTemplateId(template.id)
                  // Apply template schema to form
                  if (template.schema) {
                    setSchemaData(template.schema as any)
                  }
                  setSelectedTemplate(template.rdlTemplate || "modern")
                  setStep("form")
                }}
                onClose={() => setStep("mode")}
              />
            )}
          </div>
        )}

        {step === "form" && selectedTemplate && (
          <div className="space-y-6">
            <InvoiceForm
              templateId={selectedTemplate}
              onSubmit={handleFormSubmit}
              onBack={() => setStep("template")}
              initialData={schemaData || undefined}
              key={formKey}
            />

            {showAdvanced && (
              <div className="space-y-6">
                <ModuleSelector onChange={(modules) => setSelectedModules(modules)} />
                <FormulaBuilder
                  availableFields={["Quantity", "UnitPrice", "Amount"]}
                  onAddField={(field) => setCalculatedFields([...calculatedFields, field])}
                />
                <VersionHistoryPanel
                  projectId="current-invoice"
                  onRestore={(version) => {
                    // Restore form data from version
                    if (version.schema) {
                      setSchemaData(version.schema)
                      setSelectedTemplate(version.templateId || selectedTemplate)
                      if (version.modules) {
                        setSelectedModules(version.modules)
                      }
                      // Force form to reload with new data by updating key instead of reloading the page
                      setFormKey((k) => k + 1)
                    }
                  }}
                />
                {selectedTemplate && (
                  <CollaborationPanel templateId={selectedTemplate} />
                )}
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-primary hover:text-primary/80 text-sm font-semibold"
              >
                {showAdvanced ? "Hide Advanced Options" : "Show Advanced Options"}
              </button>
            </div>
          </div>
        )}

        {step === "generated" && (
          <div className="space-y-6">
            <GeneratedSuccess
              rdl={generatedRdl}
              schemaData={schemaData!}
              templateId={selectedTemplate}
              galleryTemplateId={galleryTemplateId}
              modules={selectedModules}
              onDownload={handleDownload}
              onReset={handleReset}
              onBack={() => setStep("form")}
              onSaveVersion={(version) => {
                // Version saved, can show notification
                console.log("Version saved:", version)
              }}
            />

            {showAdvanced && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Suspense fallback={<div className="p-6 bg-slate-100 rounded-lg">Loading developer tools...</div>}>
                    <DeveloperMode rdlXml={generatedRdl} />
                  </Suspense>
                  <Suspense fallback={<div className="p-6 bg-slate-100 rounded-lg">Loading compatibility checker...</div>}>
                    <CompatibilityChecker rdlXml={generatedRdl} />
                  </Suspense>
                </div>
                <BCDeployment rdlXml={generatedRdl} />
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-primary hover:text-primary/80 text-sm font-semibold"
              >
                {showAdvanced ? "Hide Developer Tools" : "Show Developer Tools"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
