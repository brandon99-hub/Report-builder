// HTML Preview Generator - Uses Layout Engine for Exact Positioning
// All elements positioned absolutely to match RDL exactly
import type { InvoiceSchema } from "./validation"
import {
  getCompleteInvoiceLayout,
  mmToPx,
  PAGE_WIDTH_MM,
  type LayoutElement,
  adjustLayoutForLogo
} from "./layout-engine"
import { getGalleryTemplateStyle, isGalleryTemplate } from "./gallery-template-styles"

// Format number with commas (e.g., 1000 -> "1,000.00")
function formatNumberWithCommas(value: string | number): string {
  if (!value && value !== 0) return ""
  const numStr = typeof value === "number" ? value.toString() : value
  const cleaned = numStr.replace(/[^\d.]/g, "")
  if (!cleaned) return ""

  const parts = cleaned.split(".")
  const integerPart = parts[0] || "0"
  const decimalPart = parts[1] || ""

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")

  if (decimalPart) {
    const limitedDecimal = decimalPart.slice(0, 2)
    return `${formattedInteger}.${limitedDecimal}`
  }
  return formattedInteger
}

// Replace template placeholders with actual values
function replacePlaceholders(
  value: string,
  schema: Partial<InvoiceSchema>,
  invoiceItems?: any[],
  totals?: any[],
): string {
  const invoiceNumber = schema?.invoiceNumber || ""
  const invoiceDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
  // Format due date if provided (convert from YYYY-MM-DD to formatted date)
  const dueDate = schema?.dueDate
    ? new Date(schema.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : ""
  const paymentTerms = schema?.paymentTerms || ""
  const poNumber = schema?.poNumber || ""
  const referenceNumber = schema?.referenceNumber || ""
  const currency = schema?.currency || "KSH"

  let result = value
    .replace(/{COMPANY_NAME}/g, schema?.companyName?.trim() || "Company Name")
    .replace(/{COMPANY_ADDRESS}/g, (schema?.companyAddress?.trim() || "").replace(/\n/g, "<br>"))
    .replace(/{COMPANY_EMAIL}/g, schema?.companyEmail?.trim() || "")
    .replace(/{COMPANY_PHONE}/g, schema?.companyPhone?.trim() || "")
    .replace(/{COMPANY_WEBSITE}/g, schema?.website?.trim() || "")
    .replace(/{TAX_NUMBER}/g, schema?.taxNumber?.trim() || "")
    .replace(/{VAT_NUMBER}/g, schema?.vatNumber?.trim() || "")
    .replace(/{REGISTRATION_NUMBER}/g, schema?.registrationNumber?.trim() || "")
    .replace(/{INVOICE_TITLE}/g, schema?.invoiceTitle?.trim() || "INVOICE")
    .replace(/{INVOICE_NUMBER}/g, invoiceNumber)
    .replace(/{INVOICE_DATE}/g, invoiceDate)
    .replace(/{DUE_DATE}/g, dueDate)
    .replace(/{PAYMENT_TERMS}/g, paymentTerms)
    .replace(/{PO_NUMBER}/g, poNumber)
    .replace(/{REFERENCE_NUMBER}/g, referenceNumber)
    .replace(/{CURRENCY}/g, currency)
    .replace(/{CUSTOMER_NAME}/g, schema?.customerName?.trim() || "Customer Name")
    .replace(/{CUSTOMER_COMPANY}/g, schema?.customerCompany?.trim() || "")
    .replace(/{CUSTOMER_ADDRESS}/g, (schema?.customerAddress?.trim() || "").replace(/\n/g, "<br>"))
    .replace(/{CUSTOMER_EMAIL}/g, schema?.customerEmail?.trim() || "")
    .replace(/{CUSTOMER_TAX_NUMBER}/g, schema?.customerTaxNumber?.trim() || "")
    .replace(/{CONTACT_PERSON}/g, schema?.contactPerson?.trim() || "")
    .replace(/{SHIPPING_ADDRESS}/g, (schema?.shippingAddress?.trim() || "").replace(/\n/g, "<br>"))
    .replace(/{DELIVERY_CONTACT}/g, schema?.deliveryContact?.trim() || "")
    .replace(/{DELIVERY_DATE}/g, schema?.deliveryDate || "")
    .replace(/{PAYMENT_INSTRUCTIONS}/g, schema?.paymentInstructions?.trim() || "")
    .replace(/{BANK_NAME}/g, schema?.bankName?.trim() || "")
    .replace(/{ACCOUNT_NUMBER}/g, schema?.accountNumber?.trim() || "")
    .replace(/{SWIFT_CODE}/g, schema?.swiftCode?.trim() || "")
    .replace(/{MPESA_PAYBILL}/g, schema?.mpesaPaybill?.trim() || "")
    .replace(/{MPESA_TILL}/g, schema?.mpesaTillNumber?.trim() || "")
    .replace(/{PAYMENT_LINK}/g, schema?.paymentLink?.trim() || "")
    .replace(/{THANK_YOU_MESSAGE}/g, schema?.thankYouMessage?.trim() || "Thank you for your business!")
    .replace(/{NOTES}/g, schema?.notes?.trim() || "")
    .replace(/{LEGAL_TERMS}/g, schema?.legalTerms?.trim() || "")
    .replace(/{RETURN_POLICY}/g, schema?.returnPolicy?.trim() || "")

  // Handle TOTAL_ placeholders
  if (totals && totals.length > 0 && invoiceItems) {
    const subtotal = invoiceItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0)
    const tax = subtotal * 0.16
    const grandTotal = subtotal + tax

    totals.forEach((total, idx) => {
      const fieldName = (total.fieldName || "").toLowerCase()
      let calculatedValue = 0

      if (fieldName.includes("subtotal")) {
        calculatedValue = subtotal
      } else if (fieldName.includes("tax")) {
        calculatedValue = tax
      } else if (fieldName.includes("total") && !fieldName.includes("sub")) {
        calculatedValue = grandTotal
      }

      const placeholder = `{TOTAL_${total.fieldName || idx}}`
      result = result.replace(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), `KSH ${formatNumberWithCommas(calculatedValue.toFixed(2))}`)
    })
  }

  return result
}

// Get item value for table cells
function getItemValue(item: any, col: any, currency: string): string {
  const fieldName = (col.fieldName || "").toLowerCase()

  if (fieldName.includes("description") || fieldName.includes("item")) {
    return item.description || ""
  } else if (fieldName.includes("quantity")) {
    return item.quantity || ""
  } else if (fieldName.includes("price") || fieldName.includes("unit")) {
    return item.price ? `${currency} ${formatNumberWithCommas(parseFloat(item.price).toFixed(2))}` : ""
  } else if (fieldName.includes("amount") || fieldName.includes("total") || fieldName.includes("line")) {
    return item.amount ? `${currency} ${formatNumberWithCommas(parseFloat(item.amount).toFixed(2))}` : ""
  }
  return ""
}

// Get total value
function getTotalValue(total: any, invoiceItems: any[], idx: number, currency: string): string {
  const subtotal = invoiceItems.reduce((sum: number, item: any) => sum + (parseFloat(item.amount) || 0), 0)
  const tax = subtotal * 0.16
  const grandTotal = subtotal + tax

  const fieldName = (total.fieldName || "").toLowerCase()

  if (fieldName.includes("subtotal")) {
    return `${currency} ${formatNumberWithCommas(subtotal.toFixed(2))}`
  } else if (fieldName.includes("tax")) {
    return `${currency} ${formatNumberWithCommas(tax.toFixed(2))}`
  } else if (fieldName.includes("total") && !fieldName.includes("sub")) {
    return `${currency} ${formatNumberWithCommas(grandTotal.toFixed(2))}`
  }
  return `${currency} ${formatNumberWithCommas((100 * (idx + 1)).toFixed(2))}`
}

// Render a layout element to HTML
function renderLayoutElement(element: LayoutElement, schema: Partial<InvoiceSchema>, invoiceItems?: any[], totals?: any[]): string {
  const xPx = mmToPx(element.x)
  const yPx = mmToPx(element.y)
  const widthPx = mmToPx(element.width)
  const heightPx = mmToPx(element.height)

  // Calculate line height based on font size for better readability
  const fontSize = element.fontSize || 12
  const lineHeight = fontSize < 12 ? 1.4 : fontSize < 16 ? 1.5 : 1.3

  const style = `
    position: absolute;
    left: ${xPx}px;
    top: ${yPx}px;
    width: ${widthPx}px;
    height: ${heightPx}px;
    ${element.zIndex !== undefined ? `z-index: ${element.zIndex};` : ""}
    ${element.backgroundColor ? `background-color: ${element.backgroundColor};` : ""}
    ${element.color ? `color: ${element.color};` : ""}
    ${element.fontSize ? `font-size: ${element.fontSize}pt; line-height: ${lineHeight};` : ""}
    ${element.fontFamily ? `font-family: ${element.fontFamily};` : ""}
    ${element.fontWeight ? `font-weight: ${element.fontWeight === "Bold" ? "700" : element.fontWeight === "SemiBold" ? "600" : "400"};` : ""}
    ${element.textAlign ? `text-align: ${element.textAlign.toLowerCase()};` : ""}
    ${element.paddingLeft ? `padding-left: ${mmToPx(element.paddingLeft)}px;` : ""}
    ${element.paddingRight ? `padding-right: ${mmToPx(element.paddingRight)}px;` : ""}
    ${element.paddingTop ? `padding-top: ${mmToPx(element.paddingTop)}px;` : ""}
    ${element.paddingBottom ? `padding-bottom: ${mmToPx(element.paddingBottom)}px;` : ""}
    ${element.borderColor && element.borderWidth ? getBorderStyle(element) : ""}
    box-sizing: border-box;
    overflow: hidden;
    word-wrap: break-word;
    overflow-wrap: break-word;
  `

  if (element.type === "rectangle") {
    return `<div id="${element.id}" style="${style}"></div>`
  }

  if (element.type === "text") {
    const text = element.value ? replacePlaceholders(element.value, schema, invoiceItems, totals) : ""

    // Skip rendering if text is empty or only contains label prefixes with no actual data
    // This makes billing details conditional - only show fields that have values
    if (!text || text.trim() === "") {
      return ""
    }

    // Check for empty fields with labels (e.g., "Email: ", "Phone: ", "Web: ")
    // Remove HTML tags for pattern matching
    const textWithoutHtml = text.replace(/<br\s*\/?>/gi, " ").replace(/<[^>]+>/g, "").trim()

    // Pattern to match label followed by empty or whitespace only
    const emptyLabelPatterns = [
      /^Email:\s*$/i,
      /^Phone:\s*$/i,
      /^Web:\s*$/i,
      /^Tax ID:\s*$/i,
      /^VAT:\s*$/i,
      /^Reg:\s*$/i,
      /^Contact:\s*$/i,
      /^Tax:\s*$/i,
      /^PO:\s*$/i,
      /^Ref:\s*$/i,
      /^Terms:\s*$/i,
    ]

    if (emptyLabelPatterns.some(pattern => pattern.test(textWithoutHtml))) {
      return ""
    }

    // Check if text only contains label and no actual content after placeholder replacement
    // This handles cases where placeholder was replaced with empty string
    const hasOnlyLabel = /^(Email|Phone|Web|Tax ID|VAT|Reg|Contact|Tax|PO|Ref|Terms):\s*$/i.test(textWithoutHtml)
    if (hasOnlyLabel) {
      return ""
    }

    return `<div id="${element.id}" style="${style}">${text}</div>`
  }

  if (element.type === "image") {
    const logo = schema?.logo
    if (logo?.base64) {
      // Element dimensions are already in mm (from logoElement creation)
      // Convert mm to px for CSS rendering - use EXACT dimensions from element
      const widthPx = mmToPx(element.width)
      const heightPx = mmToPx(element.height)

      return `<img 
        id="${element.id}" 
        src="${logo.base64}" 
        alt="Logo" 
        style="
          position: absolute;
          left: ${xPx}px;
          top: ${yPx}px;
          width: ${widthPx}px;
          height: ${heightPx}px;
          object-fit: fill;
          object-position: left top;
          z-index: ${element.zIndex || 2};
        " 
      />`
    }
    return ""
  }

  if (element.type === "table") {
    return renderTable(element, schema, invoiceItems || [], totals || [])
  }

  if (element.type === "line") {
    const xPx = mmToPx(element.x)
    const yPx = mmToPx(element.y)
    const widthPx = mmToPx(element.width)
    const borderWidthPx = element.borderWidth ? mmToPx(element.borderWidth * 0.35) : 1

    return `<div 
      id="${element.id}" 
      style="
        position: absolute;
        left: ${xPx}px;
        top: ${yPx}px;
        width: ${widthPx}px;
        height: ${borderWidthPx}px;
        background-color: ${element.borderColor || "#9ca3af"};
        ${element.zIndex !== undefined ? `z-index: ${element.zIndex};` : ""}
      "
    ></div>`
  }

  return ""
}

// Get border style CSS
function getBorderStyle(element: LayoutElement): string {
  if (!element.borderColor || !element.borderWidth) return ""

  const widthPx = mmToPx(element.borderWidth * 0.35) // pt to mm to px

  if (element.borderSide === "Left") {
    return `border-left: ${widthPx}px solid ${element.borderColor};`
  } else if (element.borderSide === "Right") {
    return `border-right: ${widthPx}px solid ${element.borderColor};`
  } else if (element.borderSide === "Top") {
    return `border-top: ${widthPx}px solid ${element.borderColor};`
  } else if (element.borderSide === "Bottom") {
    return `border-bottom: ${widthPx}px solid ${element.borderColor};`
  } else if (element.borderSide === "All") {
    return `border: ${widthPx}px solid ${element.borderColor};`
  }
  return ""
}

// Render table with custom colors (for gallery templates)
function renderTableWithColors(
  tableElement: LayoutElement,
  schema: Partial<InvoiceSchema>,
  invoiceItems: any[],
  totals: any[],
  colors: { primaryColor: string; secondaryColor: string; accentColor: string; textColor: string }
): string {
  if (!tableElement.columns) return ""

  const xPx = mmToPx(tableElement.x)
  const yPx = mmToPx(tableElement.y)
  const widthPx = mmToPx(tableElement.width)
  const rowHeightPx = mmToPx(tableElement.rowHeight || 10)
  const headerHeightPx = mmToPx(12)

  // Get item columns from schema
  const itemColumns = schema?.itemColumns || []
  const currency = schema?.currency || "KSH"

  // Build header row with gallery colors
  const headerCells = tableElement.columns.map((col, idx) => {
    const colWidthPx = mmToPx(col.width)
    const colDataType = itemColumns[idx]?.dataType || "text"
    const isNumeric = colDataType === "currency" || colDataType === "number"

    return `
      <th style="
        width: ${colWidthPx}px;
        height: ${headerHeightPx}px;
        background: linear-gradient(to bottom, ${colors.primaryColor}, ${colors.secondaryColor});
        color: #FFFFFF;
        font-weight: 700;
        font-size: 11pt;
        line-height: 1.4;
        padding: ${mmToPx(4)}px ${mmToPx(5)}px;
        text-align: ${isNumeric ? "right" : "left"};
        border: 1px solid ${colors.primaryColor};
        border-bottom: 2px solid ${colors.accentColor};
        box-sizing: border-box;
      ">${col.label}</th>
    `
  }).join("")

  // Build data rows (same as original)
  const dataRows = invoiceItems.length > 0
    ? invoiceItems.map((item, rowIdx) => {
      const rowCells = tableElement.columns.map((col, colIdx) => {
        const colWidthPx = mmToPx(col.width)
        const colDataType = itemColumns[colIdx]?.dataType || "text"
        const isNumeric = colDataType === "currency" || colDataType === "number"
        const value = getItemValue(item, itemColumns[colIdx] || {}, currency)

        return `
            <td style="
              width: ${colWidthPx}px;
              height: ${rowHeightPx}px;
              padding: ${mmToPx(4)}px ${mmToPx(5)}px;
              text-align: ${isNumeric ? "right" : "left"};
              color: ${colors.textColor};
              font-size: 10pt;
              line-height: 1.5;
              border-right: 1px solid #e5e7eb;
              border-bottom: 1px solid #e5e7eb;
              background-color: ${rowIdx % 2 === 0 ? "#f3f4f6" : "#ffffff"};
              box-sizing: border-box;
              word-wrap: break-word;
              overflow-wrap: break-word;
            ">${value || "-"}</td>
          `
      }).join("")

      return `<tr>${rowCells}</tr>`
    }).join("")
    : `<tr><td colspan="${tableElement.columns.length}" style="padding: ${mmToPx(8)}px; text-align: center; color: #999;">No items added</td></tr>`

  // Calculate table height
  const numRows = Math.max(1, invoiceItems.length)
  const tableHeightPx = headerHeightPx + (numRows * rowHeightPx)

  return `
    <table style="
      position: absolute;
      left: ${xPx}px;
      top: ${yPx}px;
      width: ${widthPx}px;
      height: ${tableHeightPx}px;
      border-collapse: collapse;
      background: white;
      box-sizing: border-box;
    ">
      <thead>
        <tr>${headerCells}</tr>
      </thead>
      <tbody>
        ${dataRows}
      </tbody>
    </table>
  `
}

// Render table element
function renderTable(tableElement: LayoutElement, schema: Partial<InvoiceSchema>, invoiceItems: any[], totals: any[]): string {
  if (!tableElement.columns) return ""

  const xPx = mmToPx(tableElement.x)
  const yPx = mmToPx(tableElement.y)
  const widthPx = mmToPx(tableElement.width)
  const rowHeightPx = mmToPx(tableElement.rowHeight || 10)
  const headerHeightPx = mmToPx(12)

  // Get item columns from schema
  const itemColumns = schema?.itemColumns || []
  const currency = schema?.currency || "KSH"

  // Build header row
  const headerCells = tableElement.columns.map((col, idx) => {
    const colWidthPx = mmToPx(col.width)
    const colDataType = itemColumns[idx]?.dataType || "text"
    const isNumeric = colDataType === "currency" || colDataType === "number"

    return `
      <th style="
        width: ${colWidthPx}px;
        height: ${headerHeightPx}px;
        background: linear-gradient(to bottom, #1e293b, #0f172a);
        color: #FFFFFF;
        font-weight: 700;
        font-size: 11pt;
        line-height: 1.4;
        padding: ${mmToPx(4)}px ${mmToPx(5)}px;
        text-align: ${isNumeric ? "right" : "left"};
        border: 1px solid #1e293b;
        border-bottom: 2px solid #3b82f6;
        box-sizing: border-box;
      ">${col.label}</th>
    `
  }).join("")

  // Build data rows
  const dataRows = invoiceItems.length > 0
    ? invoiceItems.map((item, rowIdx) => {
      const rowCells = tableElement.columns.map((col, colIdx) => {
        const colWidthPx = mmToPx(col.width)
        const colDataType = itemColumns[colIdx]?.dataType || "text"
        const isNumeric = colDataType === "currency" || colDataType === "number"
        const value = getItemValue(item, itemColumns[colIdx] || {}, currency)

        return `
            <td style="
              width: ${colWidthPx}px;
              height: ${rowHeightPx}px;
              padding: ${mmToPx(4)}px ${mmToPx(5)}px;
              text-align: ${isNumeric ? "right" : "left"};
              color: #1f2937;
              font-size: 10pt;
              line-height: 1.5;
              border-right: 1px solid #e5e7eb;
              border-bottom: 1px solid #e5e7eb;
              background-color: ${rowIdx % 2 === 0 ? "#f3f4f6" : "#ffffff"};
              box-sizing: border-box;
              word-wrap: break-word;
              overflow-wrap: break-word;
            ">${value || "-"}</td>
          `
      }).join("")

      return `<tr>${rowCells}</tr>`
    }).join("")
    : `<tr><td colspan="${tableElement.columns.length}" style="padding: ${mmToPx(8)}px; text-align: center; color: #999;">No items added</td></tr>`

  // Calculate table height
  const numRows = Math.max(1, invoiceItems.length)
  const tableHeightPx = headerHeightPx + (numRows * rowHeightPx)

  return `
    <table style="
      position: absolute;
      left: ${xPx}px;
      top: ${yPx}px;
      width: ${widthPx}px;
      height: ${tableHeightPx}px;
      border-collapse: collapse;
      background: white;
      box-sizing: border-box;
    ">
      <thead>
        <tr>${headerCells}</tr>
      </thead>
      <tbody>
        ${dataRows}
      </tbody>
    </table>
  `
}

export function generateHtmlPreview(schema: Partial<InvoiceSchema>, templateId: string): string {
  // Check if this is a gallery template and get its styling
  const galleryStyle = isGalleryTemplate(templateId) ? getGalleryTemplateStyle(templateId) : null
  const primaryColor = galleryStyle?.colors.primary || '#1e293b'
  const secondaryColor = galleryStyle?.colors.secondary || '#0f172a'
  const textColor = galleryStyle?.colors.text || '#1f2937'
  const accentColor = galleryStyle?.colors.accent || '#3b82f6'
  const headingFont = galleryStyle?.fonts.heading || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  const bodyFont = galleryStyle?.fonts.body || headingFont

  const itemColumns = schema?.itemColumns || []
  const totals = schema?.totals || []
  const invoiceItems = schema?.invoiceItems || []

  // Get layout from layout engine with logo position and schema for conditional rendering
  const logo = schema?.logo
  const logoPosition = logo?.position || "left"
  const logoWidth = logo?.base64 && typeof logo.width === "number" ? logo.width : 0
  const logoHeight = logo?.base64 && typeof logo.height === "number" ? logo.height : 0
  let layout = getCompleteInvoiceLayout(itemColumns, totals, invoiceItems, logoPosition, schema)

  // Adjust layout for logo dimensions to prevent overlap
  if (logo?.base64 && logoWidth > 0) {
    const pxToMm = 25.4 / 96
    const logoWidthMm = logoWidth * pxToMm
    layout = adjustLayoutForLogo(layout, logoPosition, logoWidthMm)
  }

  // Layout engine now handles logo position adaptively, so no need for manual adjustment here
  // The layout is already positioned correctly based on logoPosition parameter

  // Add logo element to layout if provided
  let logoElement: LayoutElement | null = null
  if (logo?.base64) {
    // Ensure logo dimensions are numbers
    const logoWidth = typeof logo.width === "number" ? logo.width : 100
    const logoHeight = typeof logo.height === "number" ? logo.height : 100

    // Convert px to mm (1 inch = 25.4mm, assuming 96 DPI: 1px = 25.4/96 mm)
    const pxToMm = 25.4 / 96
    const widthMm = logoWidth * pxToMm
    const heightMm = logoHeight * pxToMm

    // Use EXACT dimensions from user input - no capping or constraints
    // The user should see exactly what they input
    const actualWidthMm = widthMm
    const actualHeightMm = heightMm

    // Calculate logo position based on user's position choice
    let logoX: number
    if (logoPosition === "left") {
      logoX = 10.58 // Start position with padding
    } else {
      // Right position - calculate from right edge
      logoX = Math.max(10.58, PAGE_WIDTH_MM - actualWidthMm - 10.58)
    }

    logoElement = {
      type: "image",
      id: "CompanyLogo",
      x: logoX,
      y: 10.58,
      width: actualWidthMm, // Use exact user input
      height: actualHeightMm, // Use exact user input
      zIndex: 2,
      imageSource: logo.base64,
    }
  }

  // Render all elements (totals are already in layout)
  const elementsHtml = layout.map(element => renderLayoutElement(element, schema, invoiceItems, totals)).join("\n")

  // Render logo if provided
  const logoHtml = logoElement ? renderLayoutElement(logoElement, schema, invoiceItems, totals) : ""

  const pageWidthPx = mmToPx(PAGE_WIDTH_MM)

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: #f8f9fa;
          padding: 20px;
          color: #1f2937;
          line-height: 1.5;
        }
        .invoice-canvas {
          position: relative;
          width: ${pageWidthPx}px;
          min-height: ${mmToPx(297)}px;
          background: white;
          margin: 0 auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        table {
          border-collapse: collapse;
        }
        th, td {
          box-sizing: border-box;
        }
        /* Improved text rendering */
        div {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <div class="invoice-canvas">
        ${elementsHtml}
        ${logoHtml}
      </div>
    </body>
    </html>
  `
}
