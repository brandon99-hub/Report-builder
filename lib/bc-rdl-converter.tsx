import type { InvoiceSchema } from "./validation"

/**
 * Field mapping from user-entered fields to Business Central standard field names
 * BC provides these fields automatically in the Sales Invoice dataset
 */
export const BC_FIELD_MAPPING: Record<string, string> = {
  // Company fields - for StandardSalesDraftInvoice, first company line is CompanyAddress1
  companyName: "CompanyAddress1",
  companyAddress: "CompanyAddress1",
  
  // Invoice fields - StandardSalesDraftInvoice uses DocumentNo/DocumentDate
  invoiceNumber: "DocumentNo",
  invoiceNumberField: "DocumentNo",
  invoiceDate: "DocumentDate",
  invoiceDateField: "DocumentDate",
  invoiceTitle: "InvoiceTitle", // May not exist in BC
  dueDate: "DueDate", // May not exist in BC
  
  // Customer fields - BC may not provide these directly
  customerName: "CustomerName", // May need to use a different field
  customerNameField: "CustomerName",
  customerAddress: "CustomerAddress", // May not exist
  customerCompany: "CustomerCompany", // May not exist
  customerEmail: "CustomerEmail", // May not exist
  
  // Item fields (for table) - BC uses these exact names
  itemDescription: "Description",
  itemQuantity: "Quantity",
  itemUnitPrice: "SalesPrice", // BC uses "SalesPrice" not "UnitPrice"
  itemAmount: "Amount", // BC uses "Amount" not "LineAmount"
  itemNo: "Item", // BC uses "Item" not "ItemNo"
  
  // Totals fields - BC may calculate these or use different names
  subtotal: "Subtotal", // May need calculation
  tax: "TaxAmount", // May need calculation
  grandTotal: "GrandTotal", // May need calculation
  discount: "Discount", // BC uses "Discount"
  
  // Other fields
  currency: "CurrencySymbol", // BC uses "CurrencySymbol"
  paymentTerms: "PaymentTerms", // May not exist
  shipToAddress: "ShipToAddress", // May not exist
}

/**
 * Converts static RDL values to Business Central-compatible field expressions
 * This removes hardcoded data and replaces it with field references that BC will populate
 */
export function convertRDLToBCFormat(rdlXml: string, schema: InvoiceSchema): string {
  let bcRdl = rdlXml

  // Escape XML special characters in field expressions
  const escapeXmlForExpression = (value: string): string => {
    return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
  }

  // Header fields (Company, Invoice Number, etc.) - map to StandardSalesDraftInvoice dataset
  // Company name: use CompanyAddress1 as the primary visible line
  bcRdl = bcRdl.replace(/{COMPANY_NAME}/g, `=Fields!CompanyAddress1.Value`)
  bcRdl = bcRdl.replace(/{COMPANY_ADDRESS}/g, `=Fields!CompanyAddress1.Value`)
  
  // Replace any legacy field references to Company in header that might have been generated
  bcRdl = bcRdl.replace(/=Fields!Company\.Value/g, `=Fields!CompanyAddress1.Value`)

  // Invoice number & date: align to DocumentNo/DocumentDate in DataSet_Result
  bcRdl = bcRdl.replace(
    /Invoice #:\s*\{INVOICE_NUMBER\}/g,
    `="Invoice #: " & Fields!DocumentNo.Value`,
  )

  bcRdl = bcRdl.replace(
    /Date:\s*\{INVOICE_DATE\}/g,
    `="Date: " & Fields!DocumentDate.Value`,
  )

  // Also handle raw placeholders if they are used alone in Value elements
  bcRdl = bcRdl.replace(
    /{INVOICE_NUMBER}/g,
    `=Fields!DocumentNo.Value`,
  )
  bcRdl = bcRdl.replace(
    /{INVOICE_DATE}/g,
    `=Fields!DocumentDate.Value`,
  )

  // Customer fields - BC doesn't give us a simple Bill To block like our layout,
  // so we keep the form-provided values for BILL TO in BC mode.
  // Do NOT blank {CUSTOMER_NAME} / {CUSTOMER_ADDRESS}; they are already filled from the form.
  // We also avoid stripping generic customer field expressions so Bill To content stays visible.

  // Replace invoice title - BC may not provide this
  bcRdl = bcRdl.replace(/{INVOICE_TITLE}/g, `"Invoice"`) // Static or use parameter

  // Replace due date - StandardSalesDraftInvoice exposes DueDate
  bcRdl = bcRdl.replace(/{DUE_DATE}/g, `=Fields!DueDate.Value`)

  // Replace currency symbol
  bcRdl = bcRdl.replace(/{CURRENCY}/g, `=Fields!${BC_FIELD_MAPPING.currency}.Value`)

  // Replace field name placeholders - use empty strings for header fields
  // BC will provide these when the layout is assigned to a report
  bcRdl = bcRdl.replace(/{INVOICE_NO_FIELD}/g, `""`)
  bcRdl = bcRdl.replace(/{INVOICE_DATE_FIELD}/g, `""`)
  bcRdl = bcRdl.replace(/{CUSTOMER_NAME_FIELD}/g, `""`)

  // Remove hardcoded invoice items - BC will provide these via dataset
  // The item table structure should remain, but data rows should be removed
  // This is handled by using field expressions in the table cells instead of static values

  // Replace totals with field expressions
  bcRdl = bcRdl.replace(/Total_Subtotal/g, (match) => {
    return match.replace(/<Value>.*?<\/Value>/s, `<Value>=Fields!${BC_FIELD_MAPPING.subtotal}.Value</Value>`)
  })
  bcRdl = bcRdl.replace(/Total_Tax/g, (match) => {
    return match.replace(/<Value>.*?<\/Value>/s, `<Value>=Fields!${BC_FIELD_MAPPING.tax}.Value</Value>`)
  })
  bcRdl = bcRdl.replace(/Total_GrandTotal/g, (match) => {
    return match.replace(/<Value>.*?<\/Value>/s, `<Value>=Fields!${BC_FIELD_MAPPING.grandTotal}.Value</Value>`)
  })

  // Remove our Fields section - BC provides the dataset fields automatically
  // BC will populate the dataset when the layout is assigned to a report
  // We should not define Fields ourselves as BC controls this
  bcRdl = bcRdl.replace(
    /<Fields>[\s\S]*?<\/Fields>/,
    "" // Remove Fields section - BC provides it
  )

  return bcRdl
}


/**
 * Helper function to escape regex special characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Converts item table to BC-compatible format
 * Removes hardcoded items and ensures field expressions are used
 */
export function convertItemTableToBCFormat(itemTableXml: string): string {
  let bcTable = itemTableXml

  // Replace static item values with field expressions
  // Item description
  bcTable = bcTable.replace(
    /<Value>([^<]*Description[^<]*)<\/Value>/gi,
    `<Value>=Fields!${BC_FIELD_MAPPING.itemDescription}.Value</Value>`
  )

  // Item quantity
  bcTable = bcTable.replace(
    /<Value>([^<]*Quantity[^<]*)<\/Value>/gi,
    `<Value>=Fields!${BC_FIELD_MAPPING.itemQuantity}.Value</Value>`
  )

  // Item unit price
  bcTable = bcTable.replace(
    /<Value>([^<]*UnitPrice[^<]*)<\/Value>/gi,
    `<Value>=Fields!${BC_FIELD_MAPPING.itemUnitPrice}.Value</Value>`
  )

  // Item amount
  bcTable = bcTable.replace(
    /<Value>([^<]*Amount[^<]*)<\/Value>/gi,
    `<Value>=Fields!${BC_FIELD_MAPPING.itemAmount}.Value</Value>`
  )

  // Item number
  bcTable = bcTable.replace(
    /<Value>([^<]*ItemNo[^<]*)<\/Value>/gi,
    `<Value>=Fields!${BC_FIELD_MAPPING.itemNo}.Value</Value>`
  )

  return bcTable
}

