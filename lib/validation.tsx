export interface ValidationError {
  field: string
  message: string
  suggestion?: string
  line?: number
}

export interface LogoConfig {
  base64: string
  position: "left" | "right"
  width: number
  height: number
}

export interface InvoiceItem {
  description?: string
  quantity?: string
  price?: string
  amount?: string
  itemCode?: string
  uom?: string
  sku?: string
  weight?: string
  hsCode?: string
  serialNumber?: string
  discountPercent?: string
  taxPercent?: string
  taxAmount?: string
  totalWithTax?: string
}

export interface InvoiceSchema {
  // 1. Header / Company Information
  companyName: string
  companyAddress: string
  logo?: LogoConfig
  taxNumber?: string
  vatNumber?: string
  registrationNumber?: string
  companyEmail?: string
  companyPhone?: string
  website?: string

  // 2. Invoice Information
  invoiceTitle: string
  invoiceNumberField: string
  invoiceNumber?: string
  invoiceDateField: string
  dueDate?: string
  poNumber?: string
  referenceNumber?: string
  paymentTerms?: string
  currency?: string

  // 3. Bill To / Ship To
  customerNameField: string
  customerName?: string
  customerAddress?: string
  customerCompany?: string
  customerEmail?: string
  customerTaxNumber?: string
  contactPerson?: string

  shipToEnabled?: boolean
  shippingAddress?: string
  deliveryContact?: string
  deliveryDate?: string

  // 4. Items
  itemColumns: ItemColumn[]
  invoiceItems?: InvoiceItem[]

  // 5. Totals
  totals: TotalField[]

  // 6. Payment Section
  paymentEnabled?: boolean
  paymentInstructions?: string
  bankName?: string
  accountNumber?: string
  swiftCode?: string
  mpesaPaybill?: string
  mpesaTillNumber?: string
  paymentLink?: string

  // 7. Footer Section
  footerEnabled?: boolean
  notes?: string
  thankYouMessage?: string
  legalTerms?: string
  returnPolicy?: string
  signatureArea?: boolean
}

export interface ItemColumn {
  fieldName: string
  label: string
  dataType?: "string" | "number" | "currency" | "percentage"
  format?: string
}

export interface TotalField {
  fieldName: string
  label: string
  dataType?: "currency" | "number"
}

export function validateInvoiceSchema(schema: Partial<InvoiceSchema>): ValidationError[] {
  const errors: ValidationError[] = []

  // Company info validation
  if (!schema.companyName?.trim()) {
    errors.push({
      field: "companyName",
      message: "Company name is required",
      suggestion: "Enter your company or organization name",
    })
  }
  if (schema.companyName && schema.companyName.length > 255) {
    errors.push({
      field: "companyName",
      message: "Company name must be less than 255 characters",
      suggestion: `Current length: ${schema.companyName.length}. Please shorten to 255 characters or less.`,
    })
  }

  // Invoice field validation
  if (!schema.invoiceNumberField?.trim()) {
    errors.push({
      field: "invoiceNumberField",
      message: "Invoice number field is required",
      suggestion: "Enter the database field name for invoice numbers (e.g., 'InvoiceNo', 'InvoiceNumber')",
    })
  }
  if (!schema.invoiceDateField?.trim()) {
    errors.push({
      field: "invoiceDateField",
      message: "Invoice date field is required",
      suggestion: "Enter the database field name for invoice dates (e.g., 'InvoiceDate', 'Date')",
    })
  }
  if (!schema.customerNameField?.trim()) {
    errors.push({
      field: "customerNameField",
      message: "Customer name field is required",
      suggestion: "Enter the database field name for customer names (e.g., 'CustomerName', 'Customer')",
    })
  }

  // Item columns validation
  if (!Array.isArray(schema.itemColumns) || schema.itemColumns.length === 0) {
    errors.push({ field: "itemColumns", message: "At least one item column is required" })
  } else {
    const fieldNames = new Set<string>()
    schema.itemColumns.forEach((col: ItemColumn, idx: number) => {
      if (!col.fieldName?.trim()) {
        errors.push({
          field: `itemColumns[${idx}]`,
          message: `Column ${idx + 1}: Field name is required`,
          suggestion: "Enter the database field name for this column (e.g., 'Description', 'Quantity')",
        })
      } else if (fieldNames.has(col.fieldName)) {
        errors.push({
          field: `itemColumns[${idx}]`,
          message: `Column ${idx + 1}: Field name must be unique`,
          suggestion: `Field name '${col.fieldName}' is already used. Use a different field name.`,
        })
      } else {
        fieldNames.add(col.fieldName)
      }
      if (!col.label?.trim()) {
        errors.push({
          field: `itemColumns[${idx}]`,
          message: `Column ${idx + 1}: Label is required`,
          suggestion: "Enter a display label for this column (e.g., 'Item Description', 'Qty')",
        })
      }
    })
  }

  // Totals validation
  if (!Array.isArray(schema.totals) || schema.totals.length === 0) {
    errors.push({ field: "totals", message: "At least one total field is required" })
  } else {
    const fieldNames = new Set<string>()
    schema.totals.forEach((total: TotalField, idx: number) => {
      if (!total.fieldName?.trim()) {
        errors.push({ field: `totals[${idx}]`, message: `Total ${idx + 1}: Field name is required` })
      } else if (fieldNames.has(total.fieldName)) {
        errors.push({ field: `totals[${idx}]`, message: `Total ${idx + 1}: Field name must be unique` })
      } else {
        fieldNames.add(total.fieldName)
      }
      if (!total.label?.trim()) {
        errors.push({ field: `totals[${idx}]`, message: `Total ${idx + 1}: Label is required` })
      }
    })
  }

  return errors
}

export function sanitizeFieldName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_]/g, "_").slice(0, 128)
}
