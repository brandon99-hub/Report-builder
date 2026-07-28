"use client"

import { useState, useMemo, lazy, Suspense, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { generateHtmlPreview } from "@/lib/preview-generator"
import { parseRDL } from "@/lib/rdl-parser"
import { saveVersion, createVersionId, type TemplateVersion } from "@/lib/version-history"
import { exportProject } from "@/lib/project-export"
import { generateRDL } from "@/lib/rdl-generator"
import { toast } from "sonner"
import { CheckCircle2, Eye, Code, Download, Save, Plus, ChevronDown, FileCode, FileJson, Printer, FolderOpen, Settings, Maximize2, Minimize2, Copy, AlertCircle, RefreshCw, Loader2 } from "lucide-react"
import type { InvoiceSchema } from "@/lib/validation"
import type { RDLModule } from "@/lib/modules"
import Prism from "prismjs"
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/components/prism-markup"

// Lazy load heavy components
const DeveloperMode = lazy(() => import("@/components/developer-mode").then(m => ({ default: m.DeveloperMode })))
const CompatibilityChecker = lazy(() => import("@/components/compatibility-checker").then(m => ({ default: m.CompatibilityChecker })))

interface GeneratedSuccessProps {
  rdl: string
  schemaData: InvoiceSchema
  templateId?: string
  galleryTemplateId?: string | null
  modules?: RDLModule[]
  onDownload: () => void
  onReset: () => void
  onBack?: () => void
  onSaveVersion?: (version: TemplateVersion) => void
}

export function GeneratedSuccess({ rdl, schemaData, templateId = "modern", galleryTemplateId = null, modules = [], onDownload, onReset, onBack, onSaveVersion }: GeneratedSuccessProps) {
  const [viewMode, setViewMode] = useState<"visual" | "code">("visual")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [previewError, setPreviewError] = useState<Error | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [isSavingVersion, setIsSavingVersion] = useState(false)
  const [isDownloadingRdl, setIsDownloadingRdl] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [isCopyingCode, setIsCopyingCode] = useState(false)
  const [isDownloadingCode, setIsDownloadingCode] = useState(false)
  const previewContainerRef = useRef<HTMLDivElement>(null)
  const codeRef = useRef<HTMLPreElement>(null)

  const handleSaveVersion = async () => {
    setIsSavingVersion(true)
    try {
      // Try to save to database if user is logged in
      const response = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: schemaData.invoiceTitle || `Invoice Template ${new Date().toLocaleDateString()}`,
          description: `Invoice template saved at ${new Date().toLocaleString()}`,
          schema: schemaData,
          templateId,
          modules,
          calculatedFields: [],
          rdlXml: rdl,
        }),
      })

      if (response.ok) {
        toast.success("Template saved to your account!")
        // Also save to localStorage as backup
        const projectId = "current-invoice"
        const versionId = createVersionId(projectId)
        const version: TemplateVersion = {
          id: versionId,
          name: `Version ${new Date().toLocaleString()}`,
          schema: schemaData,
          templateId,
          modules,
          rdlXml: rdl,
          timestamp: Date.now(),
          description: `Invoice template saved at ${new Date().toLocaleString()}`,
        }
        saveVersion(version)
        onSaveVersion?.(version)
      } else {
        // Fallback to localStorage if not logged in
        const projectId = "current-invoice"
        const versionId = createVersionId(projectId)
        const version: TemplateVersion = {
          id: versionId,
          name: `Version ${new Date().toLocaleString()}`,
          schema: schemaData,
          templateId,
          modules,
          rdlXml: rdl,
          timestamp: Date.now(),
          description: `Invoice template saved at ${new Date().toLocaleString()}`,
        }
        saveVersion(version)
        toast.success("Version saved locally!")
        onSaveVersion?.(version)
      }
    } catch (error) {
      // Fallback to localStorage on error
      const projectId = "current-invoice"
      const versionId = createVersionId(projectId)
      const version: TemplateVersion = {
        id: versionId,
        name: `Version ${new Date().toLocaleString()}`,
        schema: schemaData,
        templateId,
        modules,
        rdlXml: rdl,
        timestamp: Date.now(),
        description: `Invoice template saved at ${new Date().toLocaleString()}`,
      }
      saveVersion(version)
      toast.success("Version saved locally!")
      onSaveVersion?.(version)
    } finally {
      setIsSavingVersion(false)
    }
  }

  // Use schemaData directly for preview (it has the form data user entered)
  // RDL parsing is mainly for uploaded files - for generated RDL, we already have schemaData
  const previewSchema = useMemo(() => {
    if (!schemaData) return null

    // Use actual form data - include ALL fields from schema
    return {
      // Company Information
      companyName: (schemaData.companyName || "").trim() || "Company Name",
      companyAddress: (schemaData.companyAddress || "").trim() || "",
      companyEmail: schemaData.companyEmail || "",
      companyPhone: schemaData.companyPhone || "",
      website: schemaData.website || "",
      taxNumber: schemaData.taxNumber || "",
      vatNumber: schemaData.vatNumber || "",
      registrationNumber: schemaData.registrationNumber || "",

      // Invoice Information
      invoiceTitle: (schemaData.invoiceTitle || "").trim() || "Invoice",
      invoiceNumber: schemaData.invoiceNumber || "",
      invoiceNumberField: schemaData.invoiceNumberField || "InvoiceNo",
      invoiceDateField: schemaData.invoiceDateField || "InvoiceDate",
      dueDate: schemaData.dueDate || "",
      poNumber: schemaData.poNumber || "",
      referenceNumber: schemaData.referenceNumber || "",
      paymentTerms: schemaData.paymentTerms || "",
      currency: schemaData.currency || "KSH",

      // Customer Information
      customerName: (schemaData.customerName || "").trim() || "",
      customerAddress: (schemaData.customerAddress || "").trim() || "",
      customerCompany: schemaData.customerCompany || "",
      customerEmail: schemaData.customerEmail || "",
      customerTaxNumber: schemaData.customerTaxNumber || "",
      contactPerson: schemaData.contactPerson || "",
      customerNameField: schemaData.customerNameField || "CustomerName",

      // Ship To (if enabled)
      shipToEnabled: schemaData.shipToEnabled ?? false,
      shippingAddress: schemaData.shippingAddress || "",
      deliveryContact: schemaData.deliveryContact || "",
      deliveryDate: schemaData.deliveryDate || "",

      // Payment Information (if enabled)
      paymentEnabled: schemaData.paymentEnabled ?? false,
      paymentInstructions: schemaData.paymentInstructions || "",
      bankName: schemaData.bankName || "",
      accountNumber: schemaData.accountNumber || "",
      swiftCode: schemaData.swiftCode || "",
      mpesaPaybill: schemaData.mpesaPaybill || "",
      mpesaTillNumber: schemaData.mpesaTillNumber || "",
      paymentLink: schemaData.paymentLink || "",

      // Footer (if enabled)
      footerEnabled: schemaData.footerEnabled ?? false,
      thankYouMessage: schemaData.thankYouMessage || "",
      notes: schemaData.notes || "",
      legalTerms: schemaData.legalTerms || "",
      returnPolicy: schemaData.returnPolicy || "",
      signatureArea: schemaData.signatureArea ?? false,

      // Items and Totals
      itemColumns: Array.isArray(schemaData.itemColumns) && schemaData.itemColumns.length > 0
        ? schemaData.itemColumns
        : [],
      totals: Array.isArray(schemaData.totals) && schemaData.totals.length > 0
        ? schemaData.totals
        : [],
      invoiceItems: Array.isArray(schemaData.invoiceItems) ? schemaData.invoiceItems : [],

      // Logo (with full dimensions) - destructure to ensure memoization detects changes
      logo: schemaData.logo ? {
        base64: schemaData.logo.base64 || "",
        position: schemaData.logo.position || "left",
        width: typeof schemaData.logo.width === "number" ? schemaData.logo.width : 100,
        height: typeof schemaData.logo.height === "number" ? schemaData.logo.height : 100,
      } : { base64: "", position: "left", width: 100, height: 100 },
    }
  }, [
    // Use JSON.stringify to detect all changes including nested logo dimensions
    JSON.stringify(schemaData)
  ])

  // Memoize htmlPreview to regenerate when previewSchema changes
  const [htmlPreview, setHtmlPreview] = useState<string>("")

  useEffect(() => {
    if (!previewSchema) {
      setHtmlPreview("")
      return
    }

    setPreviewError(null)
    setIsLoading(true)

    const generatePreview = async () => {
      try {
        // Use gallery template ID if available, otherwise fall back to basic template
        const effectiveTemplateId = galleryTemplateId || templateId

        // Check if gallery template (async loading needed)
        const isGallery = effectiveTemplateId.includes('-')

        if (isGallery) {
          // Dynamically import template injector
          const { loadTemplateHtml, injectDataIntoTemplate } = await import('@/lib/template-injector')
          const templateHtml = await loadTemplateHtml(effectiveTemplateId)
          const preview = injectDataIntoTemplate(templateHtml, previewSchema as any, effectiveTemplateId)
          setHtmlPreview(preview)
        } else {
          // Use sync RDL-based preview for basic templates
          const { generateHtmlPreview } = await import('@/lib/preview-generator')
          const preview = await (generateHtmlPreview as any)(previewSchema, effectiveTemplateId)
          setHtmlPreview(preview)
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Failed to generate preview:", error)
        const err = error instanceof Error ? error : new Error("Unknown error occurred")
        setPreviewError(err)
        setIsLoading(false)
      }
    }

    generatePreview()
  }, [previewSchema, templateId, galleryTemplateId, retryCount])

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (isFullscreen) {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen()
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen()
        }
      } else {
        const element = previewContainerRef.current
        if (!element) return

        if (element.requestFullscreen) {
          await element.requestFullscreen()
        } else if ((element as any).webkitRequestFullscreen) {
          await (element as any).webkitRequestFullscreen()
        } else if ((element as any).mozRequestFullScreen) {
          await (element as any).mozRequestFullScreen()
        } else if ((element as any).msRequestFullscreen) {
          await (element as any).msRequestFullscreen()
        }
      }
    } catch (error) {
      console.error("Fullscreen error:", error)
      toast.error("Could not toggle fullscreen mode. Your browser may not support fullscreen.")
    }
  }

  // Handle ESC key to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        document.exitFullscreen()
      }
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  // Syntax highlighting for code view
  useEffect(() => {
    if (viewMode === "code" && codeRef.current) {
      const codeElement = codeRef.current.querySelector("code")
      if (codeElement) {
        Prism.highlightElement(codeElement)
      }
    }
  }, [viewMode, rdl])

  const handleRetryPreview = () => {
    setRetryCount(prev => prev + 1)
    setPreviewError(null)
    setIsLoading(true)
    // Force re-generation by creating a new schema object
    if (previewSchema) {
      // The useMemo will automatically regenerate when we update the state
      // We just need to trigger a re-render
      setTimeout(() => {
        // Preview will regenerate automatically via useMemo
        setIsLoading(false)
      }, 50)
    }
  }

  const handleCopyCode = async () => {
    setIsCopyingCode(true)
    try {
      await navigator.clipboard.writeText(rdl)
      toast.success("Code copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy code")
    } finally {
      setIsCopyingCode(false)
    }
  }

  const handleDownloadCode = () => {
    setIsDownloadingCode(true)
    try {
      const element = document.createElement("a")
      element.setAttribute("href", "data:text/xml;charset=utf-8," + encodeURIComponent(rdl))
      element.setAttribute("download", "Invoice.rdl")
      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      toast.success("RDL code downloaded")
    } catch (error) {
      toast.error("Failed to download code")
    } finally {
      // Small delay to show loading state
      setTimeout(() => setIsDownloadingCode(false), 300)
    }
  }

  const handleDownloadRdl = () => {
    setIsDownloadingRdl(true)
    try {
      onDownload()
      toast.success("RDL file downloaded")
    } catch (error) {
      toast.error("Failed to download RDL")
    } finally {
      // Small delay to show loading state
      setTimeout(() => setIsDownloadingRdl(false), 300)
    }
  }
  const invoiceDateDisplay = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true)
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          invoiceSchema: schemaData,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        const message =
          errorBody?.errors?.[0]?.message ||
          errorBody?.error ||
          "Failed to generate PDF. Please try again."
        throw new Error(message)
      }

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "Invoice.pdf"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast.success("PDF downloaded")
    } catch (error) {
      console.error("PDF generation failed:", error)
      toast.error(error instanceof Error ? error.message : "Failed to generate PDF")
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4">
      <Card className="border-2 overflow-hidden">
        <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-8">
          <div className="flex items-start gap-4">
            <CheckCircle2 className="w-10 h-10 flex-shrink-0" />
            <div>
              <h2 className="text-3xl font-bold mb-2">Invoice RDL Generated!</h2>
              <p className="text-primary-foreground/90">
                Your custom RDL file is ready to download and import into Business Central or SSRS.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Summary strip above preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Company */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">COMPANY</p>
              <p className="text-sm font-medium">
                {schemaData.companyName || "Company name"}
              </p>
              {schemaData.companyAddress && (
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                  {schemaData.companyAddress}
                </p>
              )}
            </div>

            {/* Invoice meta */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">INVOICE DETAILS</p>
              <p className="text-xs text-muted-foreground">Invoice number</p>
              <p className="text-sm font-medium mb-2">
                {schemaData.invoiceNumber || "Not assigned"}
              </p>
              <p className="text-xs text-muted-foreground">Invoice date</p>
              <p className="text-sm font-medium">{invoiceDateDisplay}</p>
            </div>

            {/* Customer */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-1">CUSTOMER</p>
              <p className="text-sm font-medium">
                {schemaData.customerName || "Customer name"}
              </p>
              {schemaData.customerAddress && (
                <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                  {schemaData.customerAddress}
                </p>
              )}
            </div>
          </div>

          {/* Preview/Code Toggle */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-slate-900 dark:text-white">
                {viewMode === "visual" ? "Visual Preview" : "Generated RDL Code"}
              </label>
              <div className="flex gap-2">
                {viewMode === "visual" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleFullscreen}
                    className="text-xs"
                    title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  >
                    {isFullscreen ? (
                      <Minimize2 className="w-4 h-4 mr-1" />
                    ) : (
                      <Maximize2 className="w-4 h-4 mr-1" />
                    )}
                    {isFullscreen ? "Exit" : "Fullscreen"}
                  </Button>
                )}
                {viewMode === "code" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCode}
                    disabled={isCopyingCode}
                    className="text-xs"
                    title="Copy code to clipboard"
                  >
                    {isCopyingCode ? (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    {isCopyingCode ? "Copying..." : "Copy"}
                  </Button>
                )}
                <Button
                  variant={viewMode === "visual" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("visual")}
                  className="text-xs"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Visual
                </Button>
                <Button
                  variant={viewMode === "code" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("code")}
                  className="text-xs"
                >
                  <Code className="w-4 h-4 mr-1" />
                  Code
                </Button>
              </div>
            </div>

            {viewMode === "visual" ? (
              <div
                ref={previewContainerRef}
                className={`border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 overflow-hidden relative ${isFullscreen ? "fixed inset-0 z-50 rounded-none border-0 bg-white dark:bg-slate-900" : ""}`}
              >
                {isLoading && (
                  <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-slate-600 dark:text-slate-400">Generating preview...</p>
                    </div>
                  </div>
                )}
                {previewError && (
                  <div className="absolute inset-0 bg-white dark:bg-slate-900 flex items-center justify-center z-10 p-4">
                    <Alert variant="destructive" className="max-w-md">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Preview Generation Failed</AlertTitle>
                      <AlertDescription className="mt-2">
                        <p className="mb-3">{previewError.message || "An error occurred while generating the preview."}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleRetryPreview}
                            className="text-xs"
                          >
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
                {!previewError && htmlPreview && (
                  <iframe
                    srcDoc={htmlPreview}
                    className={`w-full border-0 ${isFullscreen ? "h-screen" : "h-[600px]"}`}
                    title="Invoice Preview"
                    sandbox={{ allow: ["same-origin"] } as any}
                    onLoad={() => setIsLoading(false)}
                  />
                )}
              </div>
            ) : (
              <div className="bg-slate-900 dark:bg-slate-950 rounded-lg max-h-[600px] overflow-hidden border border-slate-700">
                <div className="overflow-y-auto max-h-[600px] p-4">
                  <pre
                    ref={codeRef}
                    className="text-xs text-slate-200 font-mono whitespace-pre-wrap break-words"
                  >
                    <code className="language-xml">{rdl}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4 border-t">
            {/* Primary Actions */}
            <div className="flex gap-3 flex-wrap">
              {onBack && (
                <Button variant="outline" onClick={onBack} className="bg-transparent">
                  Back to Edit
                </Button>
              )}
              <Button
                onClick={handleDownloadRdl}
                disabled={isDownloadingRdl}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
              >
                {isDownloadingRdl ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                {isDownloadingRdl ? "Downloading..." : "Download RDL"}
              </Button>
              <Button
                variant="outline"
                onClick={handleDownloadPdf}
                disabled={isDownloadingPdf}
                className="bg-transparent"
              >
                {isDownloadingPdf ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Printer className="w-4 h-4 mr-2" />
                )}
                {isDownloadingPdf ? "Generating..." : "Download PDF"}
              </Button>
              <Button
                variant="outline"
                onClick={handleSaveVersion}
                disabled={isSavingVersion}
                className="bg-transparent"
              >
                {isSavingVersion ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                {isSavingVersion ? "Saving..." : "Save Version"}
              </Button>
              <Button variant="outline" onClick={onReset} className="bg-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Create Another
              </Button>
            </div>

            {/* Export Options Dropdown */}
            <div className="flex gap-2 items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    More Options
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        // Regenerate RDL with bcMode=true to use buildItemTableForBC (2 rows instead of multiple)
                        const result = generateRDL(templateId, schemaData, modules, undefined, true)

                        if (!result.success) {
                          toast.error("Failed to generate BC-compatible RDLC: " + (result.errors?.map(e => e.message).join(", ") || "Unknown error"))
                          return
                        }

                        // Convert to BC format (handles field references, data sources, etc.)
                        const { convertRDLToBCFormat } = await import("@/lib/bc-rdl-converter")
                        const bcRdl = convertRDLToBCFormat(result.rdl, schemaData!)

                        const element = document.createElement("a")
                        element.setAttribute("href", "data:text/xml;charset=utf-8," + encodeURIComponent(bcRdl))
                        element.setAttribute("download", "Invoice.rdlc")
                        element.style.display = "none"
                        document.body.appendChild(element)
                        element.click()
                        document.body.removeChild(element)
                        toast.success("RDLC file exported for Business Central")
                      } catch (error) {
                        console.error("BC export failed:", error)
                        toast.error("Failed to export BC-compatible RDLC")
                      }
                    }}
                  >
                    <FileCode className="w-4 h-4 mr-2" />
                    Export RDLC
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const schemaJson = JSON.stringify(schemaData, null, 2)
                      const element = document.createElement("a")
                      element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(schemaJson))
                      element.setAttribute("download", "invoice-schema.json")
                      element.style.display = "none"
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                      toast.success("JSON schema exported")
                    }}
                  >
                    <FileJson className="w-4 h-4 mr-2" />
                    Export JSON Schema
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const projectJson = exportProject({
                        schema: schemaData,
                        templateId,
                        modules,
                      })
                      const element = document.createElement("a")
                      element.setAttribute("href", "data:application/json;charset=utf-8," + encodeURIComponent(projectJson))
                      element.setAttribute("download", `invoice-project-${Date.now()}.json`)
                      element.style.display = "none"
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                      toast.success("Project exported")
                    }}
                  >
                    <FolderOpen className="w-4 h-4 mr-2" />
                    Export Project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const printWindow = window.open("", "_blank")
                      if (printWindow) {
                        printWindow.document.write(`
                      <!DOCTYPE html>
                      <html>
                        <head>
                          <title>Invoice Preview</title>
                          <style>
                            body { margin: 0; padding: 20px; }
                            @media print {
                              body { margin: 0; }
                            }
                          </style>
                        </head>
                        <body>
                          ${htmlPreview}
                        </body>
                      </html>
                    `)
                        printWindow.document.close()
                        setTimeout(() => {
                          printWindow.print()
                        }, 250)
                      }
                    }}
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Print/PDF
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      // This will be handled by parent component to show developer tools
                      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
                    }}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Show Developer Tools
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
