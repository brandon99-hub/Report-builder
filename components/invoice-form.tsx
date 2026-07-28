"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useUndoRedo } from "@/hooks/use-undo-redo"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EditColumnsModal } from "./edit-columns-modal"
import { BulkItemImport } from "./bulk-item-import"
import { ColumnSelector } from "./column-selector"
import { CurrencySelector } from "./currency-selector"

// Format number with commas (e.g., 1000 -> "1,000.00")
function formatNumberWithCommas(value: string | number): string {
  if (!value && value !== 0) return ""
  const numStr = typeof value === "number" ? value.toString() : value
  // Remove any existing commas and non-numeric characters except decimal point
  const cleaned = numStr.replace(/[^\d.]/g, "")
  if (!cleaned) return ""

  // Split into integer and decimal parts
  const parts = cleaned.split(".")
  const integerPart = parts[0] || "0"
  const decimalPart = parts[1] || ""

  // Add commas to integer part
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  // Combine with decimal part (limit to 2 decimal places)
  if (decimalPart) {
    const limitedDecimal = decimalPart.slice(0, 2)
    return `${formattedInteger}.${limitedDecimal}`
  }
  return formattedInteger
}

// Parse formatted number back to numeric string (e.g., "1,000.00" -> "1000.00")
function parseFormattedNumber(value: string): string {
  if (!value) return ""
  // Remove commas and keep only digits and decimal point
  return value.replace(/,/g, "")
}

import type { InvoiceSchema } from "@/lib/validation"

interface InvoiceFormProps {
  templateId: string
  onSubmit: (data: InvoiceSchema) => Promise<void> | void
  onBack: () => void
  initialData?: Partial<InvoiceSchema>
}

export function InvoiceForm({ templateId, onSubmit, onBack, initialData }: InvoiceFormProps) {
  // Use useMemo to ensure initialFormData is only calculated once
  const initialFormData = useMemo(() => {
    if (initialData) {
      return {
        companyName: initialData.companyName || "",
        companyAddress: initialData.companyAddress || "",
        invoiceTitle: initialData.invoiceTitle || "Invoice",
        invoiceNumberField: initialData.invoiceNumberField || "InvoiceNo",
        invoiceDateField: initialData.invoiceDateField || "InvoiceDate",
        customerNameField: initialData.customerNameField || "CustomerName",
        customerName: initialData.customerName || "",
        customerAddress: initialData.customerAddress || "",
        customerCompany: initialData.customerCompany || "",
        customerEmail: initialData.customerEmail || "",
        customerTaxNumber: initialData.customerTaxNumber || "",
        contactPerson: initialData.contactPerson || "",
        taxNumber: initialData.taxNumber || "",
        vatNumber: initialData.vatNumber || "",
        registrationNumber: initialData.registrationNumber || "",
        companyEmail: initialData.companyEmail || "",
        companyPhone: initialData.companyPhone || "",
        website: initialData.website || "",
        dueDate: initialData.dueDate || "",
        poNumber: initialData.poNumber || "",
        referenceNumber: initialData.referenceNumber || "",
        paymentTerms: initialData.paymentTerms || "",
        currency: initialData.currency || "KSH",
        shipToEnabled: initialData.shipToEnabled ?? false,
        shippingAddress: initialData.shippingAddress || "",
        deliveryContact: initialData.deliveryContact || "",
        deliveryDate: initialData.deliveryDate || "",
        paymentEnabled: initialData.paymentEnabled ?? false,
        paymentInstructions: initialData.paymentInstructions || "",
        bankName: initialData.bankName || "",
        accountNumber: initialData.accountNumber || "",
        swiftCode: initialData.swiftCode || "",
        mpesaPaybill: initialData.mpesaPaybill || "",
        mpesaTillNumber: initialData.mpesaTillNumber || "",
        paymentLink: initialData.paymentLink || "",
        footerEnabled: initialData.footerEnabled ?? false,
        notes: initialData.notes || "",
        thankYouMessage: initialData.thankYouMessage || "",
        legalTerms: initialData.legalTerms || "",
        returnPolicy: initialData.returnPolicy || "",
        signatureArea: initialData.signatureArea ?? false,
        logo: initialData.logo || {
          base64: "",
          position: "left" as "left" | "right",
          width: 100,
          height: 100,
        },
        itemColumns: initialData.itemColumns || [
          { label: "Description", fieldName: "Description" },
          { label: "Quantity", fieldName: "Quantity" },
          { label: "Price", fieldName: "UnitPrice" },
          { label: "Amount", fieldName: "LineAmount" },
        ],
        totals: initialData.totals || [
          { label: "Subtotal", fieldName: "Subtotal" },
          { label: "Tax", fieldName: "Tax" },
          { label: "Total", fieldName: "GrandTotal" },
        ],
        invoiceItems: initialData.invoiceItems || [
          { description: "Sample Item 1", quantity: "1", price: "100.00", amount: "100.00" },
          { description: "Sample Item 2", quantity: "2", price: "50.00", amount: "100.00" },
        ],
      }
    }
    return {
      companyName: "",
      companyAddress: "",
      invoiceTitle: "Invoice",
      invoiceNumberField: "InvoiceNo",
      invoiceDateField: "InvoiceDate",
      customerNameField: "CustomerName",
      customerName: "",
      customerAddress: "",
      customerCompany: "",
      customerEmail: "",
      customerTaxNumber: "",
      contactPerson: "",
      taxNumber: "",
      vatNumber: "",
      registrationNumber: "",
      companyEmail: "",
      companyPhone: "",
      website: "",
      dueDate: "",
      poNumber: "",
      referenceNumber: "",
      paymentTerms: "",
      currency: "KSH",
      shipToEnabled: false,
      shippingAddress: "",
      deliveryContact: "",
      deliveryDate: "",
      paymentEnabled: false,
      paymentInstructions: "",
      bankName: "",
      accountNumber: "",
      swiftCode: "",
      mpesaPaybill: "",
      mpesaTillNumber: "",
      paymentLink: "",
      footerEnabled: false,
      notes: "",
      thankYouMessage: "",
      legalTerms: "",
      returnPolicy: "",
      signatureArea: false,
      logo: {
        base64: "",
        position: "left" as "left" | "right",
        width: 100,
        height: 100,
      },
      itemColumns: [
        { label: "Description", fieldName: "Description" },
        { label: "Quantity", fieldName: "Quantity" },
        { label: "Price", fieldName: "UnitPrice" },
        { label: "Amount", fieldName: "LineAmount" },
      ],
      totals: [
        { label: "Subtotal", fieldName: "Subtotal" },
        { label: "Tax", fieldName: "Tax" },
        { label: "Total", fieldName: "GrandTotal" },
      ],
      invoiceItems: [
        { description: "Sample Item 1", quantity: "1", price: "100.00", amount: "100.00" },
        { description: "Sample Item 2", quantity: "2", price: "50.00", amount: "100.00" },
      ],
    }
  }, [initialData]) // Only recalculate if initialData changes

  const {
    state: formData,
    setState: setFormData,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo(initialFormData)

  const [errors, setErrors] = useState<string[]>([])
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [editingModal, setEditingModal] = useState<"columns" | "totals" | null>(null)
  const [showBulkImport, setShowBulkImport] = useState(false)

  // Real-time validation - use JSON.stringify to create stable dependency
  useEffect(() => {
    const newFieldErrors: Record<string, string> = {}

    // Use optional chaining and provide defaults for all string fields
    if (!(formData.companyName || "").trim()) {
      newFieldErrors.companyName = "Company name is required"
    }

    if (!formData.itemColumns || formData.itemColumns.length === 0) {
      newFieldErrors.itemColumns = "At least one item column is required"
    }

    if (!(formData.customerNameField || "").trim()) {
      newFieldErrors.customerNameField = "Customer name field is required"
    }

    if (!(formData.invoiceNumberField || "").trim()) {
      newFieldErrors.invoiceNumberField = "Invoice number field is required"
    }

    if (!(formData.invoiceDateField || "").trim()) {
      newFieldErrors.invoiceDateField = "Invoice date field is required"
    }

    // Validate item columns
    if (formData.itemColumns) {
      formData.itemColumns.forEach((col, idx) => {
        if (!(col.label || "").trim()) {
          newFieldErrors[`itemColumn_${idx}_label`] = "Column label is required"
        }
        if (!(col.fieldName || "").trim()) {
          newFieldErrors[`itemColumn_${idx}_fieldName`] = "Field name is required"
        }
      })
    }

    setFieldErrors(newFieldErrors)
  }, [
    // Use JSON.stringify to create stable dependency that only changes when content changes
    JSON.stringify({
      companyName: formData.companyName || "",
      itemColumns: formData.itemColumns || [],
      customerNameField: formData.customerNameField || "",
      invoiceNumberField: formData.invoiceNumberField || "",
      invoiceDateField: formData.invoiceDateField || "",
    })
  ])
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const formDataRef = useRef(formData)
  const draftLoadedRef = useRef(false)
  const DRAFT_STORAGE_KEY = "invoice_form_draft"

  // Auto-set due date to 30 days from today if not set
  useEffect(() => {
    if (!formData.dueDate) {
      const today = new Date()
      const dueDate = new Date(today)
      dueDate.setDate(today.getDate() + 30)
      const dueDateString = dueDate.toISOString().split('T')[0] // Format as YYYY-MM-DD
      setFormData((prev) => ({ ...prev, dueDate: dueDateString }))
    }
  }, [formData.dueDate]) // Run when dueDate changes (including when it's empty)

  // Keep ref in sync with formData
  useEffect(() => {
    formDataRef.current = formData
  }, [formData])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        if (canUndo) undo()
      } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault()
        if (canRedo) redo()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canUndo, canRedo, undo, redo])

  // Load draft on mount if no initialData (only once)
  useEffect(() => {
    // Only load draft once on mount, before user starts typing
    if (!initialData && !draftLoadedRef.current) {
      try {
        const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY)
        if (savedDraft) {
          const draft = JSON.parse(savedDraft)
          // Only load if draft is recent (within 24 hours)
          const draftAge = Date.now() - (draft.timestamp || 0)
          if (draftAge < 24 * 60 * 60 * 1000 && draft.data) {
            setFormData(draft.data)
            setLastSaved(new Date(draft.timestamp))
          }
        }
        // Mark as loaded regardless of whether we found/used a draft
        draftLoadedRef.current = true
      } catch (error) {
        console.error("Failed to load draft:", error)
        draftLoadedRef.current = true // Mark as loaded even on error
      }
    }
  }, [initialData]) // Only depend on initialData - setFormData is stable from useUndoRedo

  // Set up auto-save interval (separate effect to avoid recreating interval)
  useEffect(() => {
    autoSaveIntervalRef.current = setInterval(() => {
      try {
        // Use ref to get the latest formData value without causing re-renders
        const currentFormData = formDataRef.current
        const draft = {
          data: currentFormData,
          templateId,
          timestamp: Date.now(),
        }
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
        setLastSaved(new Date())
      } catch (error) {
        console.error("Failed to save draft:", error)
      }
    }, 30000) // 30 seconds

    // Cleanup on unmount
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current)
      }
    }
  }, [templateId]) // Only recreate interval when templateId changes

  // Save draft when form data changes (debounced)
  // Use JSON.stringify to create stable dependency
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        const draft = {
          data: formData,
          templateId,
          timestamp: Date.now(),
        }
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
      } catch (error) {
        console.error("Failed to save draft:", error)
      }
    }, 2000) // Debounce: save 2 seconds after last change

    return () => clearTimeout(timeoutId)
  }, [JSON.stringify(formData), templateId])

  const [isGeneratingRdl, setIsGeneratingRdl] = useState(false)

  const handleValidateAndSubmit = async () => {
    const newErrors: string[] = []

    if (!formData.companyName.trim()) newErrors.push("Company name is required")
    if (formData.itemColumns.length === 0) newErrors.push("At least one item column is required")
    if (!formData.customerNameField.trim()) newErrors.push("Customer name field is required")

    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setIsGeneratingRdl(true)
      // Clear draft only when we actually submit
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      await Promise.resolve(onSubmit(formData))
    } finally {
      setIsGeneratingRdl(false)
    }
  }

  return (
    <>
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div>
          <Card className="border-2">
            <div className="p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white" id="invoice-form-title">
                  Configure Invoice Schema
                </h2>
                {lastSaved && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    💾 Draft saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-8">
                Customize the fields and layout for your invoice template
              </p>

              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-lg">
                  <p className="font-semibold text-red-800 dark:text-red-200 mb-2">Please fix these issues:</p>
                  <ul className="space-y-1">
                    {errors.map((error, i) => (
                      <li key={i} className="text-red-700 dark:text-red-300 text-sm flex items-center gap-2">
                        <span className="text-lg">•</span> {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-6">
                {/* Company Info Section */}
                <div>
                  <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">
                    Company Information
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="company-name" className="text-xs font-medium text-muted-foreground mb-1 block">
                        Company Name *
                      </label>
                      <Input
                        id="company-name"
                        aria-label="Company name"
                        aria-required="true"
                        aria-invalid={!!fieldErrors.companyName}
                        aria-describedby={fieldErrors.companyName ? "company-name-error" : undefined}
                        value={formData.companyName || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                        placeholder="e.g., Acme Corporation"
                        className={`w-full ${fieldErrors.companyName ? "border-red-500 focus:border-red-500" : ""}`}
                      />
                      {fieldErrors.companyName && (
                        <p id="company-name-error" className="text-xs text-red-600 mt-1" role="alert">
                          {fieldErrors.companyName}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Address</label>
                      <Input
                        value={formData.companyAddress || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, companyAddress: e.target.value }))}
                        placeholder="e.g., 123 Main St, City, State"
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Tax / VAT Number</label>
                        <Input
                          value={formData.taxNumber || formData.vatNumber || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              taxNumber: e.target.value,
                              vatNumber: e.target.value,
                            }))
                          }
                          placeholder="e.g., PIN / VAT number"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Registration Number
                        </label>
                        <Input
                          value={formData.registrationNumber || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, registrationNumber: e.target.value }))
                          }
                          placeholder="e.g., Company registration no."
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Email</label>
                        <Input
                          value={formData.companyEmail || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, companyEmail: e.target.value }))}
                          placeholder="e.g., billing@company.com"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Company Phone</label>
                        <Input
                          value={formData.companyPhone || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, companyPhone: e.target.value }))}
                          placeholder="e.g., +254 712 345678"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Website</label>
                        <Input
                          value={formData.website || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, website: e.target.value }))}
                          placeholder="e.g., https://company.com"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Invoice Title</label>
                      <Input
                        value={formData.invoiceTitle || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, invoiceTitle: e.target.value }))}
                        placeholder="e.g., Invoice"
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Due Date</label>
                        <Input
                          type="date"
                          value={formData.dueDate || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">PO Number</label>
                        <Input
                          value={formData.poNumber || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, poNumber: e.target.value }))}
                          placeholder="Optional purchase order number"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Reference Number</label>
                        <Input
                          value={formData.referenceNumber || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, referenceNumber: e.target.value }))}
                          placeholder="Optional internal reference"
                          className="w-full"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Payment Terms</label>
                        <Input
                          value={formData.paymentTerms || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                          placeholder="e.g., Net 30"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Currency</label>
                        <Select
                          value={formData.currency || "KSH"}
                          onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="KSH">KSH - Kenyan Shilling</SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">GBP - British Pound</SelectItem>
                            <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                            <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                            <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                            <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                            <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                            <SelectItem value="GHS">GHS - Ghanaian Cedi</SelectItem>
                            <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                            <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                            <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Logo Upload Section */}
                    <div className="border-t pt-4 mt-4">
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">Company Logo</label>
                      <div className="space-y-3">
                        {formData.logo?.base64 && (
                          <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                            <img
                              src={formData.logo.base64}
                              alt="Company Logo"
                              className="border rounded"
                              style={{
                                width: `${formData.logo?.width || 100}px`,
                                height: `${formData.logo?.height || 100}px`,
                                objectFit: "fill"
                              }}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setFormData((prev) => ({
                                ...prev,
                                logo: {
                                  ...(prev.logo || { base64: "", position: "left" as const, width: 100, height: 100 }),
                                  base64: ""
                                }
                              }))}
                              className="text-xs"
                            >
                              Remove Logo
                            </Button>
                          </div>
                        )}
                        <div>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                const reader = new FileReader()
                                reader.onloadend = () => {
                                  const base64String = reader.result as string
                                  setFormData((prev) => ({
                                    ...prev,
                                    logo: {
                                      ...(prev.logo || { base64: "", position: "left" as const, width: 100, height: 100 }),
                                      base64: base64String
                                    },
                                  }))
                                }
                                reader.readAsDataURL(file)
                              }
                            }}
                            className="text-xs"
                          />
                        </div>
                        {formData.logo?.base64 && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Position</label>
                              <select
                                value={formData.logo?.position || "left"}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    logo: {
                                      ...(prev.logo || { base64: "", position: "left" as const, width: 100, height: 100 }),
                                      position: e.target.value as "left" | "right"
                                    },
                                  }))
                                }
                                className="w-full text-xs px-3 py-2 border rounded-md bg-background"
                              >
                                <option value="left">Left</option>
                                <option value="right">Right</option>
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Width (px)</label>
                              <Input
                                type="number"
                                min="50"
                                max="300"
                                value={formData.logo?.width || 100}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    logo: {
                                      ...(prev.logo || { base64: "", position: "left" as const, width: 100, height: 100 }),
                                      width: parseInt(e.target.value) || 100
                                    },
                                  }))
                                }
                                className="w-full text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-medium text-muted-foreground mb-1 block">Height (px)</label>
                              <Input
                                type="number"
                                min="50"
                                max="300"
                                value={formData.logo?.height || 100}
                                onChange={(e) =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    logo: {
                                      ...(prev.logo || { base64: "", position: "left" as const, width: 100, height: 100 }),
                                      height: parseInt(e.target.value) || 100
                                    },
                                  }))
                                }
                                className="w-full text-xs"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Info Section */}
                <div className="border-t pt-6">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white mb-3 block">
                    Customer Information
                  </label>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Company</label>
                      <Input
                        value={formData.customerCompany || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, customerCompany: e.target.value }))
                        }
                        placeholder="e.g., ABC Corporation"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Name</label>
                      <Input
                        value={formData.customerName || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customerName: e.target.value }))}
                        placeholder="e.g., ABC Corporation"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Address</label>
                      <Input
                        value={formData.customerAddress || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, customerAddress: e.target.value }))}
                        placeholder="e.g., 456 Business Ave, City, State"
                        className="w-full"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">Customer Email</label>
                        <Input
                          value={formData.customerEmail || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))
                          }
                          placeholder="e.g., finance@client.com"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Customer Tax / VAT Number
                        </label>
                        <Input
                          value={formData.customerTaxNumber || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, customerTaxNumber: e.target.value }))
                          }
                          placeholder="Optional tax ID"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Contact Person
                        </label>
                        <Input
                          value={formData.contactPerson || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, contactPerson: e.target.value }))
                          }
                          placeholder="e.g., John Doe"
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ship To Section (optional) */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                      Shipping Information
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="ship-to-enabled"
                        type="checkbox"
                        checked={!!formData.shipToEnabled}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, shipToEnabled: e.target.checked }))
                        }
                      />
                      <label htmlFor="ship-to-enabled" className="text-xs text-muted-foreground">
                        Enable Ship To section
                      </label>
                    </div>
                  </div>
                  {formData.shipToEnabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Shipping Address
                        </label>
                        <Input
                          value={formData.shippingAddress || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, shippingAddress: e.target.value }))
                          }
                          placeholder="e.g., Warehouse / delivery address"
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Delivery Contact
                          </label>
                          <Input
                            value={formData.deliveryContact || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, deliveryContact: e.target.value }))
                            }
                            placeholder="e.g., receiver name / phone"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Delivery Date
                          </label>
                          <Input
                            type="date"
                            value={formData.deliveryDate || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, deliveryDate: e.target.value }))
                            }
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Invoice Items Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white block">Invoice Items</label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Add invoice line items to preview how your invoice will look
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowBulkImport(true)} className="text-xs">
                        Bulk Import
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            invoiceItems: [
                              ...prev.invoiceItems,
                              { description: "", quantity: "", price: "", amount: "" },
                            ],
                          }))
                        }
                        className="text-xs"
                      >
                        + Add Item
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {(formData.invoiceItems || []).map((item, idx) => {
                      const itemColumns = formData.itemColumns || []
                      const descCol = itemColumns.find((col) =>
                        col.fieldName.toLowerCase().includes("description") || col.fieldName.toLowerCase().includes("item"),
                      ) || itemColumns[0]
                      const qtyCol = itemColumns.find((col) => col.fieldName.toLowerCase().includes("quantity"))
                      const priceCol = itemColumns.find((col) =>
                        col.fieldName.toLowerCase().includes("price") || col.fieldName.toLowerCase().includes("unit"),
                      )
                      const amountCol = itemColumns.find((col) =>
                        col.fieldName.toLowerCase().includes("amount") || col.fieldName.toLowerCase().includes("total"),
                      )

                      return (
                        <div key={idx} className="p-4 bg-muted/50 rounded-lg border border-border/50 space-y-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-muted-foreground">Item {idx + 1}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setFormData((prev) => ({
                                  ...prev,
                                  invoiceItems: prev.invoiceItems.filter((_, i) => i !== idx),
                                }))
                              }
                              className="text-xs text-destructive hover:bg-destructive/10"
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            {descCol && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                  {descCol.label}
                                </label>
                                <Input
                                  value={item.description || ""}
                                  onChange={(e) => {
                                    const updated = [...formData.invoiceItems]
                                    updated[idx].description = e.target.value
                                    setFormData((prev) => ({ ...prev, invoiceItems: updated }))
                                  }}
                                  placeholder="e.g., Web Development Services"
                                  className="text-sm"
                                />
                              </div>
                            )}
                            {qtyCol && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                  {qtyCol.label}
                                </label>
                                <Input
                                  type="number"
                                  value={item.quantity || ""}
                                  onChange={(e) => {
                                    const updated = [...formData.invoiceItems]
                                    updated[idx].quantity = e.target.value
                                    // Auto-calculate amount if quantity and price are available
                                    if (priceCol && amountCol && e.target.value && updated[idx].price) {
                                      const qty = parseFloat(e.target.value) || 0
                                      const price = parseFloat(parseFormattedNumber(updated[idx].price)) || 0
                                      updated[idx].amount = (qty * price).toFixed(2)
                                    }
                                    setFormData((prev) => ({ ...prev, invoiceItems: updated }))
                                  }}
                                  placeholder="e.g., 10"
                                  className="text-sm"
                                />
                              </div>
                            )}
                            {priceCol && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                  {priceCol.label}
                                </label>
                                <Input
                                  type="text"
                                  value={formatNumberWithCommas(item.price || "")}
                                  onChange={(e) => {
                                    const updated = [...formData.invoiceItems]
                                    const parsedValue = parseFormattedNumber(e.target.value)
                                    updated[idx].price = parsedValue
                                    // Auto-calculate amount if quantity and price are available
                                    if (qtyCol && amountCol && parsedValue && updated[idx].quantity) {
                                      const qty = parseFloat(parseFormattedNumber(updated[idx].quantity)) || 0
                                      const price = parseFloat(parsedValue) || 0
                                      updated[idx].amount = (qty * price).toFixed(2)
                                    }
                                    setFormData((prev) => ({ ...prev, invoiceItems: updated }))
                                  }}
                                  placeholder="e.g., 1,500.00"
                                  className="text-sm"
                                />
                              </div>
                            )}
                            {amountCol && (
                              <div>
                                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                                  {amountCol.label}
                                </label>
                                <Input
                                  type="text"
                                  value={formatNumberWithCommas(item.amount || "")}
                                  onChange={(e) => {
                                    const updated = [...formData.invoiceItems]
                                    const parsedValue = parseFormattedNumber(e.target.value)
                                    updated[idx].amount = parsedValue
                                    setFormData((prev) => ({ ...prev, invoiceItems: updated }))
                                  }}
                                  placeholder="e.g., 1,500.00"
                                  className="text-sm"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Totals Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-900 dark:text-white block">Totals</label>
                      <p className="text-xs text-muted-foreground mt-1">
                        Auto-calculated from your invoice items
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setEditingModal("totals")} className="text-xs">
                      Edit Totals
                    </Button>
                  </div>
                  <div className="space-y-3 bg-muted/50 p-4 rounded-lg">
                    {(() => {
                      // Calculate totals from invoice items
                      const subtotal = (formData.invoiceItems || []).reduce(
                        (sum: number, item: any) => sum + (parseFloat(item.amount) || 0),
                        0,
                      )
                      const taxRate = 0.16 // 16% (fixed)
                      const tax = subtotal * taxRate
                      const grandTotal = subtotal + tax

                      return (formData.totals || []).map((total, idx) => {
                        const fieldName = (total.fieldName || "").toLowerCase()
                        let calculatedValue = 0
                        let isGrandTotal = false

                        if (fieldName.includes("subtotal")) {
                          calculatedValue = subtotal
                        } else if (fieldName.includes("tax")) {
                          calculatedValue = tax
                        } else if (fieldName.includes("total") && !fieldName.includes("sub")) {
                          calculatedValue = grandTotal
                          isGrandTotal = true
                        }

                        return (
                          <div
                            key={idx}
                            className={`flex items-center justify-between text-sm p-3 rounded-lg ${isGrandTotal ? "bg-primary/10 border-2 border-primary/30" : "bg-background"
                              }`}
                          >
                            <span className={`font-medium ${isGrandTotal ? "text-primary font-bold" : "text-foreground"}`}>
                              {total.label}:
                            </span>
                            <span
                              className={`font-mono text-sm px-3 py-1 rounded ${isGrandTotal
                                  ? "bg-primary text-primary-foreground font-bold"
                                  : "bg-muted text-foreground"
                                }`}
                            >
                              KSH {formatNumberWithCommas(calculatedValue.toFixed(2))}
                            </span>
                          </div>
                        )
                      })
                    })()}
                  </div>
                </div>

                {/* Payment Section (optional) */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                      Payment Details
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="payment-enabled"
                        type="checkbox"
                        checked={!!formData.paymentEnabled}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, paymentEnabled: e.target.checked }))
                        }
                      />
                      <label htmlFor="payment-enabled" className="text-xs text-muted-foreground">
                        Enable Payment section
                      </label>
                    </div>
                  </div>
                  {formData.paymentEnabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Payment Instructions
                        </label>
                        <Input
                          value={formData.paymentInstructions || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, paymentInstructions: e.target.value }))
                          }
                          placeholder="e.g., Please pay within 30 days via bank transfer or M-PESA"
                          className="w-full"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Bank Name
                          </label>
                          <Input
                            value={formData.bankName || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, bankName: e.target.value }))
                            }
                            placeholder="e.g., Equity Bank"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Account Number
                          </label>
                          <Input
                            value={formData.accountNumber || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))
                            }
                            placeholder="e.g., 0123456789"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            Swift Code
                          </label>
                          <Input
                            value={formData.swiftCode || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, swiftCode: e.target.value }))
                            }
                            placeholder="e.g., EQBLKENA"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            M-PESA Paybill
                          </label>
                          <Input
                            value={formData.mpesaPaybill || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, mpesaPaybill: e.target.value }))
                            }
                            placeholder="Optional"
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground mb-1 block">
                            M-PESA Till Number
                          </label>
                          <Input
                            value={formData.mpesaTillNumber || ""}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, mpesaTillNumber: e.target.value }))
                            }
                            placeholder="Optional"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Payment Link (URL)
                        </label>
                        <Input
                          value={formData.paymentLink || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, paymentLink: e.target.value }))
                          }
                          placeholder="Optional payment link"
                          className="w-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Section (optional) */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">
                      Footer & Notes
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        id="footer-enabled"
                        type="checkbox"
                        checked={!!formData.footerEnabled}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, footerEnabled: e.target.checked }))
                        }
                      />
                      <label htmlFor="footer-enabled" className="text-xs text-muted-foreground">
                        Enable Footer section
                      </label>
                    </div>
                  </div>
                  {formData.footerEnabled && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Thank You Message
                        </label>
                        <Input
                          value={formData.thankYouMessage || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, thankYouMessage: e.target.value }))
                          }
                          placeholder="e.g., Thank you for your business!"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Notes
                        </label>
                        <Input
                          value={formData.notes || ""}
                          onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                          placeholder="Optional extra notes"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Legal Terms
                        </label>
                        <Input
                          value={formData.legalTerms || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, legalTerms: e.target.value }))
                          }
                          placeholder="e.g., Late payments incur interest..."
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground mb-1 block">
                          Return / Refund Policy
                        </label>
                        <Input
                          value={formData.returnPolicy || ""}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, returnPolicy: e.target.value }))
                          }
                          placeholder="Optional"
                          className="w-full"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="signature-area"
                          type="checkbox"
                          checked={!!formData.signatureArea}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, signatureArea: e.target.checked }))
                          }
                        />
                        <label htmlFor="signature-area" className="text-xs text-muted-foreground">
                          Include signature area
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-6 border-t">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={undo}
                      disabled={!canUndo}
                      className="text-xs flex-1 sm:flex-initial"
                      title="Undo (Ctrl+Z)"
                    >
                      ↶ Undo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={redo}
                      disabled={!canRedo}
                      className="text-xs flex-1 sm:flex-initial"
                      title="Redo (Ctrl+Y)"
                    >
                      ↷ Redo
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button variant="outline" onClick={onBack} className="flex-1 bg-transparent">
                      Back
                    </Button>
                    <Button
                      onClick={handleValidateAndSubmit}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                      aria-label="Generate RDL report"
                      type="button"
                      disabled={isGeneratingRdl}
                    >
                      {isGeneratingRdl ? "Generating..." : "Generate RDL"}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {editingModal && editingModal === "totals" && (
        <EditColumnsModal
          mode={editingModal}
          data={formData.totals}
          onSave={(updated) => {
            setFormData((prev) => ({ ...prev, totals: updated }))
            setEditingModal(null)
          }}
          onClose={() => setEditingModal(null)}
        />
      )}

      {showBulkImport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            <BulkItemImport
              onImport={(items) => {
                setFormData((prev) => ({
                  ...prev,
                  invoiceItems: [...prev.invoiceItems, ...items],
                }))
                setShowBulkImport(false)
              }}
              onClose={() => setShowBulkImport(false)}
            />
          </div>
        </div>
      )}
    </>
  )
}
