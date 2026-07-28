// Layout Mapping Layer - Single Source of Truth for Invoice Layout
// All measurements in millimeters (mm)
// Both HTML preview and RDL generator consume this layout specification

export interface LayoutElement {
  type: "text" | "rectangle" | "table" | "image" | "line"
  id: string
  x: number // Left position in mm
  y: number // Top position in mm
  width: number // Width in mm
  height: number // Height in mm
  zIndex?: number
  // Style properties
  backgroundColor?: string
  color?: string
  fontSize?: number // in pt
  fontFamily?: string
  fontWeight?: "Normal" | "Bold" | "SemiBold"
  textAlign?: "Left" | "Center" | "Right"
  borderColor?: string
  borderWidth?: number // in pt
  borderSide?: "Left" | "Right" | "Top" | "Bottom" | "All"
  paddingLeft?: number // in mm
  paddingRight?: number // in mm
  paddingTop?: number // in mm
  paddingBottom?: number // in mm
  // Content
  value?: string // Static text or template placeholder like {COMPANY_NAME}
  // For tables
  columns?: Array<{ width: number; label: string }> // Column widths in mm
  rowHeight?: number // in mm
  // For images
  imageSource?: string
}

// Page dimensions - A4
export const PAGE_WIDTH_MM = 210
export const PAGE_HEIGHT_MM = 297

// Conversion: 1mm = 3.779527559px (at 96 DPI)
export const MM_TO_PX = 96 / 25.4
export const PX_TO_MM = 25.4 / 96

// Convert mm to px for CSS
export function mmToPx(mm: number): number {
  return mm * MM_TO_PX
}

// Convert px to mm for RDL
export function pxToMm(px: number): number {
  return px * PX_TO_MM
}

// Modern Invoice Template Layout Definition
export function getModernInvoiceLayout(logoPosition: "left" | "right" = "left"): LayoutElement[] {
  return [
    // Header Background Rectangle
    {
      type: "rectangle",
      id: "HeaderBackground",
      x: 0,
      y: 0,
      width: PAGE_WIDTH_MM,
      height: 60,
      backgroundColor: "#1e3a5f",
      zIndex: 0,
    },
    // Company Name (in header, left side, aligned next to logo)
    {
      type: "text",
      id: "CompanyName",
      x: logoPosition === "left" ? 40 : 80, // Adjust based on logo position
      y: 16,
      width: 95,
      height: 14,
      value: "{COMPANY_NAME}",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: 26,
      fontWeight: "Bold",
      color: "#FFFFFF",
      zIndex: 2, // Above the header background
    },
    // Company Address (in header, below company name)
    {
      type: "text",
      id: "CompanyAddress",
      x: logoPosition === "left" ? 40 : 80, // Adjust based on logo position
      y: 30,
      width: 95,
      height: 10,
      value: "{COMPANY_ADDRESS}",
      fontFamily: "Georgia, 'Times New Roman', serif",
      fontSize: 11,
      color: "#e5e7eb",
      zIndex: 2, // Above the header background
    },
    // Invoice Meta Box (enhanced styling with better visual design)
    {
      type: "rectangle",
      id: "InvoiceMetaBox",
      x: logoPosition === "left" ? 130 : 10.58, // Right side if logo left, left side if logo right
      y: 10.58,
      width: 70,
      height: 45, // Slightly increased for better spacing
      backgroundColor: "#f8fafc", // Light background for better contrast
      zIndex: 1,
      paddingLeft: 5.29, // 20px
      paddingRight: 5.29,
      paddingTop: 5.29,
      paddingBottom: 5.29,
      borderSide: "All",
      borderColor: "#3b82f6", // Blue border for visual separation
      borderWidth: 0.53, // 2pt border for better visibility
    },
    // Invoice Title (in meta box) - enhanced typography
    {
      type: "text",
      id: "InvoiceTitle",
      x: logoPosition === "left" ? 130 : 10.58, // Adjust based on logo position
      y: 15,
      width: 70,
      height: 10,
      value: "{INVOICE_TITLE}",
      fontSize: 22,
      fontWeight: "Bold",
      color: "#1e293b", // Dark text for light background
      textAlign: logoPosition === "left" ? "Right" : "Left", // Adjust alignment
      zIndex: 2, // Above the meta box background
    },
    // Invoice Number (in meta box) - better spacing
    {
      type: "text",
      id: "InvoiceNumber",
      x: logoPosition === "left" ? 130 : 10.58, // Adjust based on logo position
      y: 27,
      width: 70,
      height: 6,
      value: "Invoice #: {INVOICE_NUMBER}",
      fontSize: 13,
      color: "#475569", // Dark gray for light background
      textAlign: logoPosition === "left" ? "Right" : "Left", // Adjust alignment
      zIndex: 2, // Above the meta box background
    },
    // Invoice Date (in meta box) - better spacing
    {
      type: "text",
      id: "InvoiceDate",
      x: logoPosition === "left" ? 130 : 10.58, // Adjust based on logo position
      y: 35,
      width: 70,
      height: 6,
      value: "Date: {INVOICE_DATE}",
      fontSize: 13,
      color: "#475569", // Dark gray for light background
      textAlign: logoPosition === "left" ? "Right" : "Left", // Adjust alignment
      zIndex: 2, // Above the meta box background
    },
    // Invoice Due Date (in meta box) - better spacing
    {
      type: "text",
      id: "InvoiceDueDate",
      x: logoPosition === "left" ? 130 : 10.58, // Adjust based on logo position
      y: 43,
      width: 70,
      height: 6,
      value: "Due: {DUE_DATE}",
      fontSize: 12,
      color: "#64748b", // Medium gray for due date
      textAlign: logoPosition === "left" ? "Right" : "Left", // Adjust alignment
      zIndex: 2, // Above the meta box background
    },
    // Additional Invoice Metadata (below meta box if provided)
    // These will be conditionally rendered in preview-generator if values exist
    // PO Number
    {
      type: "text",
      id: "InvoicePONumber",
      x: logoPosition === "left" ? 130 : 10.58,
      y: 58,
      width: 70,
      height: 5,
      value: "PO: {PO_NUMBER}",
      fontSize: 10,
      color: "#9ca3af",
      textAlign: logoPosition === "left" ? "Right" : "Left",
      zIndex: 2,
    },
    // Reference Number
    {
      type: "text",
      id: "InvoiceReferenceNumber",
      x: logoPosition === "left" ? 130 : 10.58,
      y: 64,
      width: 70,
      height: 5,
      value: "Ref: {REFERENCE_NUMBER}",
      fontSize: 10,
      color: "#9ca3af",
      textAlign: logoPosition === "left" ? "Right" : "Left",
      zIndex: 2,
    },
    // Payment Terms
    {
      type: "text",
      id: "InvoicePaymentTerms",
      x: logoPosition === "left" ? 130 : 10.58,
      y: 70,
      width: 70,
      height: 5,
      value: "Terms: {PAYMENT_TERMS}",
      fontSize: 10,
      color: "#9ca3af",
      textAlign: logoPosition === "left" ? "Right" : "Left",
      zIndex: 2,
    },
    // Bill From Box (dynamic height - will adjust based on visible fields)
    {
      type: "rectangle",
      id: "BillFromBox",
      x: 10.58,
      y: 70, // After header (60mm) + body padding (10.58mm)
      width: 85,
      height: 65, // Increased height for better spacing
      backgroundColor: "#f8fafc", // Slightly lighter for distinction
      borderSide: "All",
      borderColor: "#e2e8f0",
      borderWidth: 0.35, // 1pt border
      paddingLeft: 5.29, // 20px
      paddingRight: 5.29,
      paddingTop: 5.29,
      paddingBottom: 5.29,
    },
    // Bill From Label
    {
      type: "text",
      id: "BillFromLabel",
      x: 15.87, // Inside box padding
      y: 75.29,
      width: 80,
      height: 5,
      value: "BILL FROM",
      fontSize: 10,
      fontWeight: "Bold",
      color: "#475569",
      letterSpacing: 0.5,
    },
    // Bill From Name
    {
      type: "text",
      id: "BillFromName",
      x: 15.87,
      y: 81.5,
      width: 80,
      height: 7,
      value: "{COMPANY_NAME}",
      fontSize: 16,
      fontWeight: "Bold",
      color: "#1e293b",
      lineHeight: 1.3,
    },
    // Bill From Address
    {
      type: "text",
      id: "BillFromAddress",
      x: 15.87,
      y: 89,
      width: 80,
      height: 14,
      value: "{COMPANY_ADDRESS}",
      fontSize: 12,
      color: "#475569",
      lineHeight: 1.4,
    },
    // Bill From Contact Info (grouped together, conditional rendering)
    // Email
    {
      type: "text",
      id: "BillFromEmail",
      x: 15.87,
      y: 104,
      width: 80,
      height: 5,
      value: "Email: {COMPANY_EMAIL}",
      fontSize: 10,
      color: "#64748b",
      lineHeight: 1.4,
    },
    // Phone
    {
      type: "text",
      id: "BillFromPhone",
      x: 15.87,
      y: 109.5,
      width: 80,
      height: 5,
      value: "Phone: {COMPANY_PHONE}",
      fontSize: 10,
      color: "#64748b",
      lineHeight: 1.4,
    },
    // Website
    {
      type: "text",
      id: "BillFromWebsite",
      x: 15.87,
      y: 115,
      width: 80,
      height: 5,
      value: "Web: {COMPANY_WEBSITE}",
      fontSize: 10,
      color: "#64748b",
      lineHeight: 1.4,
    },
    // Tax/VAT/Registration (grouped together, smaller font, conditional)
    // Tax Number
    {
      type: "text",
      id: "BillFromTaxNumber",
      x: 15.87,
      y: 121,
      width: 80,
      height: 4,
      value: "Tax ID: {TAX_NUMBER}",
      fontSize: 9,
      color: "#94a3b8",
      lineHeight: 1.3,
    },
    // VAT Number
    {
      type: "text",
      id: "BillFromVATNumber",
      x: 15.87,
      y: 125.5,
      width: 80,
      height: 4,
      value: "VAT: {VAT_NUMBER}",
      fontSize: 9,
      color: "#94a3b8",
      lineHeight: 1.3,
    },
    // Registration Number
    {
      type: "text",
      id: "BillFromRegistrationNumber",
      x: 15.87,
      y: 130,
      width: 80,
      height: 4,
      value: "Reg: {REGISTRATION_NUMBER}",
      fontSize: 9,
      color: "#94a3b8",
      lineHeight: 1.3,
    },
    // Bill To Box (dynamic height - will adjust based on visible fields)
    {
      type: "rectangle",
      id: "BillToBox",
      x: 115, // Right column: 10.58 (left) + 85 (width) + 10.58 (gap) = 106.16, rounded to 115
      y: 70,
      width: 85,
      height: 60, // Increased height for better spacing
      backgroundColor: "#f1f5f9", // Slightly different shade for visual distinction
      borderSide: "All",
      borderColor: "#e2e8f0",
      borderWidth: 0.35, // 1pt border
      paddingLeft: 5.29,
      paddingRight: 5.29,
      paddingTop: 5.29,
      paddingBottom: 5.29,
    },
    // Bill To Label
    {
      type: "text",
      id: "BillToLabel",
      x: 120.29,
      y: 75.29,
      width: 80,
      height: 5,
      value: "BILL TO",
      fontSize: 10,
      fontWeight: "Bold",
      color: "#475569",
      letterSpacing: 0.5,
    },
    // Bill To Name
    {
      type: "text",
      id: "BillToName",
      x: 120.29,
      y: 81.5,
      width: 80,
      height: 7,
      value: "{CUSTOMER_NAME}",
      fontSize: 16,
      fontWeight: "Bold",
      color: "#1e293b",
      lineHeight: 1.3,
    },
    // Bill To Address
    {
      type: "text",
      id: "BillToAddress",
      x: 120.29,
      y: 89,
      width: 80,
      height: 14,
      value: "{CUSTOMER_ADDRESS}",
      fontSize: 12,
      color: "#475569",
      lineHeight: 1.4,
    },
    // Bill To Company (conditional - only if provided)
    {
      type: "text",
      id: "BillToCompany",
      x: 120.29,
      y: 104,
      width: 80,
      height: 5,
      value: "{CUSTOMER_COMPANY}",
      fontSize: 12,
      color: "#475569",
      fontWeight: "SemiBold",
      lineHeight: 1.4,
    },
    // Bill To Email (conditional)
    {
      type: "text",
      id: "BillToEmail",
      x: 120.29,
      y: 109.5,
      width: 80,
      height: 5,
      value: "Email: {CUSTOMER_EMAIL}",
      fontSize: 10,
      color: "#64748b",
      lineHeight: 1.4,
    },
    // Bill To Tax Number (conditional)
    {
      type: "text",
      id: "BillToTaxNumber",
      x: 120.29,
      y: 115,
      width: 80,
      height: 4,
      value: "Tax ID: {CUSTOMER_TAX_NUMBER}",
      fontSize: 9,
      color: "#94a3b8",
      lineHeight: 1.3,
    },
    // Bill To Contact Person (conditional)
    {
      type: "text",
      id: "BillToContactPerson",
      x: 120.29,
      y: 119.5,
      width: 80,
      height: 4,
      value: "Contact: {CONTACT_PERSON}",
      fontSize: 9,
      color: "#94a3b8",
      lineHeight: 1.3,
    },
    // Items Table - positioned dynamically based on billing section
    // This will be generated by buildItemTableLayout()
    // Totals Section - positioned dynamically based on table
    // Footer - conditionally rendered by buildFooterLayout() based on footerEnabled
  ]
}

// Generate table layout based on columns
export function buildItemTableLayout(
  itemColumns: any[],
  startY: number = 135 // After billing section (increased from 115 to accommodate expanded boxes)
): LayoutElement {
  const colCount = itemColumns.length
  // Fixed column widths - distribute evenly across available width (189mm)
  const availableWidth = 189
  const colWidth = availableWidth / colCount
  
  return {
    type: "table",
    id: "ItemsTable",
    x: 10.58, // Body padding
    y: startY,
    width: availableWidth,
    height: 60, // Dynamic based on rows
    columns: itemColumns.map((col) => ({
      width: colWidth,
      label: col.label || col.fieldName || "Column",
    })),
    rowHeight: 10, // Fixed row height in mm
    backgroundColor: "#ffffff",
  }
}

// Generate totals layout based on totals array and table end position
export function buildTotalsLayout(
  totals: any[],
  tableEndY: number,
  spacing: number = 10
): LayoutElement[] {
  return totals.map((total, idx) => {
    const y = tableEndY + spacing + (idx * 7) // 7mm spacing between totals
    const isFinal = idx === totals.length - 1
    
    return [
      // Label
      {
        type: "text",
        id: `TotalLabel_${total.fieldName || idx}`,
        x: 70,
        y: y,
        width: 55,
        height: isFinal ? 8 : 6,
        value: `${total.label}:`,
        fontSize: isFinal ? 13 : 11,
        fontWeight: isFinal ? "Bold" : "SemiBold",
        color: isFinal ? "#1e293b" : "#374151",
        textAlign: "Right",
      },
      // Value
      {
        type: "text",
        id: `TotalValue_${total.fieldName || idx}`,
        x: 130,
        y: y,
        width: 50,
        height: isFinal ? 8 : 6,
        value: `{TOTAL_${total.fieldName || idx}}`,
        fontSize: isFinal ? 13 : 11,
        fontWeight: isFinal ? "Bold" : "SemiBold",
        color: isFinal ? "#1e293b" : "#374151",
        textAlign: "Right",
        backgroundColor: isFinal ? "#f1f5f9" : "transparent",
      },
    ]
  }).flat()
}

// Get complete layout for an invoice
export function getCompleteInvoiceLayout(
  itemColumns: any[],
  totals: any[],
  invoiceItems?: any[],
  logoPosition: "left" | "right" = "left",
  schema?: Partial<any> // Pass schema for conditional footer rendering
): LayoutElement[] {
  const baseLayout = getModernInvoiceLayout(logoPosition)
  
  // Add table layout
  const tableLayout = buildItemTableLayout(itemColumns)
  
  // Calculate table end position
  const numRows = invoiceItems?.length || 1
  const tableEndY = tableLayout.y + 12 + (numRows * tableLayout.rowHeight!) // Header + rows
  
  // Add totals layout
  const totalsLayout = buildTotalsLayout(totals, tableEndY)
  
  // Calculate footer start position (after totals)
  const lastTotalY = totalsLayout.length > 0 
    ? Math.max(...totalsLayout.map(t => t.y + (t.height || 0)))
    : tableEndY
  const footerStartY = lastTotalY + 15 // 15mm spacing after totals
  
  // Build footer layout conditionally
  const footerLayout = buildFooterLayout(schema, footerStartY)
  
  // Combine all layouts
  return [...baseLayout, tableLayout, ...totalsLayout, ...footerLayout]
}

// Build footer layout conditionally based on footerEnabled
function buildFooterLayout(schema?: Partial<any>, startY: number = 250): LayoutElement[] {
  if (!schema?.footerEnabled) {
    return []
  }
  
  const elements: LayoutElement[] = []
  let currentY = startY
  const footerPadding = 10.58
  
  // Footer background box
  elements.push({
    type: "rectangle",
    id: "FooterBox",
    x: 0,
    y: startY,
    width: PAGE_WIDTH_MM,
    height: 40, // Will be adjusted based on content
    backgroundColor: "#f8fafc",
    borderSide: "Top",
    borderColor: "#cbd5e1",
    borderWidth: 0.53, // 2pt for better visibility
  })
  
  currentY = startY + 8
  
  // Thank you message - centered
  if (schema.thankYouMessage) {
    elements.push({
      type: "text",
      id: "FooterThankYou",
      x: 0,
      y: currentY,
      width: PAGE_WIDTH_MM,
      height: 8,
      value: "{THANK_YOU_MESSAGE}",
      fontSize: 14,
      fontWeight: "Bold",
      color: "#475569",
      textAlign: "Center",
      zIndex: 2,
    })
    currentY += 12
  }
  
  // Notes - left aligned with padding, only if thank you message exists, add spacing
  if (schema.notes) {
    const notesY = schema.thankYouMessage ? currentY : startY + 8
    elements.push({
      type: "text",
      id: "FooterNotes",
      x: footerPadding,
      y: notesY,
      width: PAGE_WIDTH_MM - (footerPadding * 2),
      height: 10,
      value: "{NOTES}",
      fontSize: 11,
      color: "#64748b",
      textAlign: "Left",
      zIndex: 2,
    })
    currentY = Math.max(currentY, notesY + 12)
  }
  
  // Legal Terms - left aligned with padding
  if (schema.legalTerms) {
    elements.push({
      type: "text",
      id: "FooterLegalTerms",
      x: footerPadding,
      y: currentY,
      width: PAGE_WIDTH_MM - (footerPadding * 2),
      height: 10,
      value: "{LEGAL_TERMS}",
      fontSize: 10,
      color: "#94a3b8",
      textAlign: "Left",
      zIndex: 2,
    })
    currentY += 12
  }
  
  // Return Policy - left aligned with padding
  if (schema.returnPolicy) {
    elements.push({
      type: "text",
      id: "FooterReturnPolicy",
      x: footerPadding,
      y: currentY,
      width: PAGE_WIDTH_MM - (footerPadding * 2),
      height: 10,
      value: "{RETURN_POLICY}",
      fontSize: 10,
      color: "#94a3b8",
      textAlign: "Left",
      zIndex: 2,
    })
    currentY += 12
  }
  
  // Signature Area
  if (schema.signatureArea) {
    currentY += 5
    elements.push({
      type: "line",
      id: "FooterSignatureLine",
      x: PAGE_WIDTH_MM - 60,
      y: currentY,
      width: 50,
      height: 0,
      borderColor: "#9ca3af",
      borderWidth: 0.35,
      zIndex: 2,
    })
    elements.push({
      type: "text",
      id: "FooterSignatureLabel",
      x: PAGE_WIDTH_MM - 60,
      y: currentY + 3,
      width: 50,
      height: 5,
      value: "Signature",
      fontSize: 9,
      color: "#9ca3af",
      textAlign: "Center",
      zIndex: 2,
    })
    currentY += 10
  }
  
  // Update footer box height based on content
  const footerHeight = currentY - startY + 5
  const footerBox = elements.find(e => e.id === "FooterBox")
  if (footerBox) {
    footerBox.height = footerHeight
  }
  
  return elements
}

// Adjust layout elements based on logo dimensions to prevent overlap
export function adjustLayoutForLogo(
  layout: LayoutElement[],
  logoPosition: "left" | "right",
  logoWidthMm: number
): LayoutElement[] {
  // If logo is on the left and is large, adjust company name position
  if (logoPosition === "left" && logoWidthMm > 30) {
    // Logo extends from 10.58mm, so company name should start after logo + padding
    const companyNameStartX = 10.58 + logoWidthMm + 5 // Logo end + 5mm padding
    const companyAddressStartX = companyNameStartX
    
    return layout.map(element => {
      if (element.id === "CompanyName") {
        return { ...element, x: Math.max(companyNameStartX, 40) }
      }
      if (element.id === "CompanyAddress") {
        return { ...element, x: Math.max(companyAddressStartX, 40) }
      }
      return element
    })
  }
  
  return layout
}

