import { getTemplate } from "./templates"
import { buildItemTableXml, buildItemTableWithData, buildItemTableForBC, buildTotalsXml, buildShipToSection, buildPaymentSection, buildFooterSection } from "./rdl-builders"
import { validateInvoiceSchema, sanitizeFieldName, type InvoiceSchema } from "./validation"
import { generateModularRDL } from "./modular-rdl-generator"
import type { RDLModule } from "./modules"
import { buildCalculatedFieldXml } from "./formula-builder"
import type { CalculatedField } from "./formula-builder"
import { applyTemplateStyle } from "./template-styling"
import { getVisibleColumns } from "./column-visibility"

interface LogoConfig {
  base64: string
  position: "left" | "right"
  width: number
  height: number
}

export function generateInvoiceNumber(): string {
  const currentYear = new Date().getFullYear()
  const storageKey = `invoice_counter_${currentYear}`
  let counter = 1

  // Client-side sequential counter using localStorage
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      counter = parseInt(stored, 10) || 1
    }
    counter = counter > 999 ? 1 : counter // Reset to 1 if exceeds 999
    localStorage.setItem(storageKey, (counter + 1).toString())
  }

  const sequence = counter.toString().padStart(3, "0")
  return `INV-${currentYear}-${sequence}`
}

export interface RDLGenerationResult {
  success: boolean
  rdl?: string
  errors?: Array<{ field: string; message: string }>
  warnings?: string[]
}

export function generateRDL(
  templateId: string,
  schema: InvoiceSchema,
  modules?: RDLModule[],
  calculatedFields?: CalculatedField[],
  bcMode: boolean = false
): RDLGenerationResult {
  // Validate schema
  const validationErrors = validateInvoiceSchema(schema)
  if (validationErrors.length > 0) {
    return { success: false, errors: validationErrors }
  }

  try {
    // Use modular generator if modules are provided
    if (modules && modules.length > 0) {
      let modularRdl = generateModularRDL({
        templateId,
        schema,
        modules,
      })

      // Add logo if provided (same logic as non-modular path)
      const logo = schema.logo || { base64: "", position: "left", width: 100, height: 100 }
      if (logo.base64) {
        const { imageXml, embeddedImagesXml } = buildLogoXml(logo, templateId)

        // Insert logo image element inside HeaderBackground rectangle's ReportItems
        if (logo.position === "left") {
          // Insert at the beginning of HeaderBackground ReportItems
          const headerStartPattern = /(<Rectangle Name="HeaderBackground">\s*<ReportItems>\s*)/m
          if (headerStartPattern.test(modularRdl)) {
            modularRdl = modularRdl.replace(headerStartPattern, `$1              ${imageXml}\n              `)
          }
        } else {
          // Right position: insert before closing ReportItems of HeaderBackground
          const headerReportItemsClosePattern = /(<\/ReportItems>)\s*(<Style>\s*<BackgroundColor>#1e3a5f)/m
          if (headerReportItemsClosePattern.test(modularRdl)) {
            modularRdl = modularRdl.replace(headerReportItemsClosePattern, `              ${imageXml}\n            $1\n            $2`)
          }
        }

        // Insert EmbeddedImages section at report level
        if (!modularRdl.includes("<EmbeddedImages>")) {
          modularRdl = modularRdl.replace(/(\s+)(<ReportSections>)/, `$1${embeddedImagesXml}\n$1$2`)
        }
      }

      // If logo is on the right, shift invoice header text/meta block left
      if (logo.position === "right") {
        modularRdl = shiftInvoiceHeaderForRightLogo(modularRdl)
      }

      // Add calculated fields if provided
      if (calculatedFields && calculatedFields.length > 0) {
        // Calculate positions for calculated fields (stack them vertically)
        const calculatedFieldsXml = calculatedFields
          .map((field, idx) => {
            const top = `${200 + (idx * 10)}mm` // Start below totals section
            return buildCalculatedFieldXml(field, {
              top,
              left: "130mm",
              width: "50mm",
              height: "8mm"
            })
          })
          .join("\n")

        // Insert calculated fields before closing ReportItems
        const reportItemsPattern = /(<\/ReportItems>)/i
        if (reportItemsPattern.test(modularRdl)) {
          modularRdl = modularRdl.replace(reportItemsPattern, `${calculatedFieldsXml}\n          $1`)
        }
      }

      // Apply template styling (colors, fonts, borders)
      modularRdl = applyTemplateStyle(modularRdl, templateId)

      return { success: true, rdl: modularRdl }
    }

    const template = getTemplate(templateId)

    // Build dynamic sections with enhanced error handling
    const itemTableXml = buildItemTableXml(schema.itemColumns)

    // Build item table - use BC mode if requested, otherwise use data if available
    const itemTableWithData = bcMode
      ? buildItemTableForBC(schema.itemColumns || [])
      : (schema.invoiceItems && schema.invoiceItems.length > 0)
        ? buildItemTableWithData(schema.itemColumns, schema.invoiceItems)
        : itemTableXml

    const totalsXml = buildTotalsXml(schema.totals, schema.invoiceItems, bcMode)

    // Use invoice number from schema if provided
    const invoiceNumber = schema.invoiceNumber || null

    // Prepare address values with line breaks
    const companyAddressFormatted = (schema.companyAddress || "").replace(/\n/g, "&#x0A;")
    const customerAddressFormatted = (schema.customerAddress || "").replace(/\n/g, "&#x0A;")

    // Format dates
    const invoiceDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    const dueDate = schema.dueDate
      ? new Date(schema.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      : ""

    // Build conditional sections
    const shipToXml = buildShipToSection(schema)
    const paymentXml = buildPaymentSection(schema)
    const footerXml = buildFooterSection(schema, bcMode)

    // Build customer company and email placeholders (positioned relative to BillToBox)
    const customerCompanyXml = schema.customerCompany
      ? `              <Textbox Name="BillToCompany">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>${escapeXml(schema.customerCompany)}</Value>
                        <Style>
                          <FontSize>13pt</FontSize>
                          <Color>#1f2937</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontSize>13pt</FontSize>
                  <Color>#1f2937</Color>
                </Style>
                <Top>25mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>6mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>`
      : ""

    const customerEmailXml = schema.customerEmail
      ? `              <Textbox Name="BillToEmail">
                <Paragraphs>
                  <Paragraph>
                    <TextRuns>
                      <TextRun>
                        <Value>${escapeXml(schema.customerEmail)}</Value>
                        <Style>
                          <FontSize>12pt</FontSize>
                          <Color>#6b7280</Color>
                        </Style>
                      </TextRun>
                    </TextRuns>
                  </Paragraph>
                </Paragraphs>
                <Style>
                  <FontSize>12pt</FontSize>
                  <Color>#6b7280</Color>
                </Style>
                <Top>32mm</Top>
                <Left>5.29mm</Left>
                <Width>80mm</Width>
                <Height>6mm</Height>
                <CanGrow>false</CanGrow>
                <CanShrink>false</CanShrink>
              </Textbox>`
      : ""

    // Replace placeholders with sanitized values
    let rdl = template
      .replace(/{COMPANY_NAME}/g, escapeXml(schema.companyName || ""))
      .replace(/{COMPANY_ADDRESS}/g, escapeXml(companyAddressFormatted))
      .replace(/{INVOICE_TITLE}/g, escapeXml(schema.invoiceTitle || "Invoice"))
      .replace(/{CUSTOMER_NAME}/g, escapeXml(schema.customerName || ""))
      .replace(/{CUSTOMER_ADDRESS}/g, escapeXml(customerAddressFormatted))
      .replace(/{CUSTOMER_COMPANY}/g, customerCompanyXml)
      .replace(/{CUSTOMER_EMAIL}/g, customerEmailXml)
      .replace(/{INVOICE_NO_FIELD}/g, sanitizeFieldName(schema.invoiceNumberField))
      .replace(/{INVOICE_DATE_FIELD}/g, sanitizeFieldName(schema.invoiceDateField))
      .replace(/{CUSTOMER_NAME_FIELD}/g, sanitizeFieldName(schema.customerNameField))
      .replace(/{ITEM_TABLE_XML}/g, itemTableWithData)
      .replace(/{TOTALS_SECTION}/g, totalsXml)
      .replace(/{SHIP_TO_SECTION}/g, shipToXml)
      .replace(/{PAYMENT_SECTION}/g, paymentXml)
      .replace(/{FOOTER_SECTION}/g, footerXml)

    // In BC mode, convert to BC format; otherwise replace with static values
    if (bcMode) {
      // BC mode: Convert static values to field expressions
      const { convertRDLToBCFormat } = require("./bc-rdl-converter")
      rdl = convertRDLToBCFormat(rdl, schema)
    } else {
      // Preview mode: Replace ALL field references with static values from form
      // Replace invoice number field references with actual value
      if (invoiceNumber) {
        const invoiceNoFieldPattern = `=Fields!${sanitizeFieldName(schema.invoiceNumberField)}.Value`
        rdl = rdl.replace(new RegExp(escapeRegex(invoiceNoFieldPattern), "g"), escapeXml(invoiceNumber))
        rdl = rdl.replace(/{INVOICE_NUMBER}/g, escapeXml(invoiceNumber))
      }

      // Replace invoice date field references with actual date value
      const invoiceDateFieldPattern = `=Fields!${sanitizeFieldName(schema.invoiceDateField)}.Value`
      rdl = rdl.replace(new RegExp(escapeRegex(invoiceDateFieldPattern), "g"), escapeXml(invoiceDate))
      rdl = rdl.replace(/{INVOICE_DATE}/g, escapeXml(invoiceDate))

      // Replace due date placeholder
      rdl = rdl.replace(/{DUE_DATE}/g, escapeXml(dueDate))

      // Replace currency symbol (used in totals)
      const currency = schema.currency || "KSH"
      rdl = rdl.replace(/{CURRENCY}/g, escapeXml(currency))

      // Replace customer name field references with static value
      const customerNameFieldPattern = `=Fields!${sanitizeFieldName(schema.customerNameField)}.Value`
      rdl = rdl.replace(new RegExp(escapeRegex(customerNameFieldPattern), "g"), escapeXml(schema.customerName || ""))

      // Remove all other field references - replace with empty string or appropriate static value
      // This ensures no field references remain when we have static data
      if (schema.invoiceItems && schema.invoiceItems.length > 0) {
        // Replace any remaining =Fields! references with empty strings
        rdl = rdl.replace(/=Fields![^}]+\.Value/g, "")
      }
    }

    // Add logo if provided
    const logo = schema.logo || { base64: "", position: "left", width: 100, height: 100 }
    if (logo.base64) {
      const { imageXml, embeddedImagesXml } = buildLogoXml(logo, templateId)

      // Insert logo image element inside HeaderBackground rectangle's ReportItems
      if (logo.position === "left") {
        // Insert at the beginning of HeaderBackground ReportItems, before CompanyName
        const headerStartPattern = /(<Rectangle Name="HeaderBackground">\s*<ReportItems>\s*)/m
        if (headerStartPattern.test(rdl)) {
          rdl = rdl.replace(headerStartPattern, `$1              ${imageXml}\n              `)
        }
      } else {
        // Right position: insert before closing ReportItems of HeaderBackground
        // Find the closing </ReportItems> before the Style tag of HeaderBackground
        const headerReportItemsClosePattern = /(<\/ReportItems>)\s*(<Style>\s*<BackgroundColor>#1e3a5f)/m
        if (headerReportItemsClosePattern.test(rdl)) {
          rdl = rdl.replace(headerReportItemsClosePattern, `              ${imageXml}\n            $1\n            $2`)
        }
      }

      // Insert EmbeddedImages section at report level (before ReportSections tag)
      // Only add if it doesn't already exist
      if (!rdl.includes("<EmbeddedImages>")) {
        rdl = rdl.replace(/(\s+)(<ReportSections>)/, `$1${embeddedImagesXml}\n$1$2`)
      }
    }

    // If logo is on the right, shift invoice header text/meta block left
    if (logo.position === "right") {
      rdl = shiftInvoiceHeaderForRightLogo(rdl)
    }

    // Add calculated fields if provided
    if (calculatedFields && calculatedFields.length > 0) {
      // Calculate positions for calculated fields (stack them vertically)
      const calculatedFieldsXml = calculatedFields
        .map((field, idx) => {
          const top = `${200 + (idx * 10)}mm` // Start below totals section
          return buildCalculatedFieldXml(field, {
            top,
            left: "130mm",
            width: "50mm",
            height: "8mm"
          })
        })
        .join("\n")

      // Insert calculated fields before closing ReportItems
      const reportItemsPattern = /(<\/ReportItems>)/i
      if (reportItemsPattern.test(rdl)) {
        rdl = rdl.replace(reportItemsPattern, `${calculatedFieldsXml}\n          $1`)
      }
    }

    // Apply template styling (colors, fonts, borders)
    rdl = applyTemplateStyle(rdl, templateId)

    // Validate XML structure
    if (!rdl.includes("<Report")) {
      throw new Error("Invalid RDL template structure")
    }

    return { success: true, rdl }
  } catch (error) {
    console.error("[v0] RDL generation error:", error)

    // Enhanced error messages with suggestions
    let errorMessage = "Failed to generate RDL"
    let suggestion = "Please check your input data and try again"

    if (error instanceof Error) {
      errorMessage = error.message

      // Provide specific suggestions based on error type
      if (error.message.includes("template")) {
        suggestion = "Ensure the template ID is valid (simple, modern, or corporate)"
      } else if (error.message.includes("XML") || error.message.includes("structure")) {
        suggestion = "The generated XML structure may be invalid. Check template configuration."
      } else if (error.message.includes("field")) {
        suggestion = "Verify all required fields are filled and field names are valid"
      } else if (error.message.includes("column")) {
        suggestion = "Ensure at least one item column is configured with valid field names"
      }
    }

    return {
      success: false,
      errors: [
        {
          field: "general",
          message: `${errorMessage}. ${suggestion}`,
        },
      ],
    }
  }
}

function escapeXml(str: string): string {
  if (typeof str !== "string") return ""
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

// Build RDL XML for embedded logo image
function buildLogoXml(logo: LogoConfig, templateId?: string): { imageXml: string; embeddedImagesXml: string } {
  if (!logo.base64) return { imageXml: "", embeddedImagesXml: "" }

  // Extract base64 data (remove data:image/...;base64, prefix if present)
  const base64Data = logo.base64.includes(",")
    ? logo.base64.split(",")[1]
    : logo.base64

  // Determine image format from base64 prefix
  let mimeType = "image/png"
  if (logo.base64.includes("data:image/jpeg") || logo.base64.includes("data:image/jpg")) {
    mimeType = "image/jpeg"
  } else if (logo.base64.includes("data:image/gif")) {
    mimeType = "image/gif"
  }

  // Convert px to mm (1 inch = 25.4mm, assuming 96 DPI: 1px = 25.4/96 mm)
  const pxToMm = 25.4 / 96
  const widthMm = (logo.width * pxToMm).toFixed(2)
  const heightMm = (logo.height * pxToMm).toFixed(2)

  // Calculate position based on logo position setting and template
  // For MODERN template, header starts at 0mm, CompanyName is at Left=15mm, Top=15mm
  let left: string
  let top: string

  if (logo.position === "left") {
    // Position logo to the left of company name (CompanyName is at 15mm, so logo at 10mm)
    // Logo is inside HeaderBackground rectangle, so positions are relative to rectangle
    left = "10mm"
    top = "15mm"
  } else {
    // Right position: position on the right side of header
    // InvoiceMetaBox is at Left=155mm, so position logo just before it (around 140-145mm)
    left = `${Math.max(140, 210 - parseFloat(widthMm) - 10).toFixed(2)}mm`
    top = "15mm"
  }

  const imageXml = `<Image Name="CompanyLogo">
        <Source>Embedded</Source>
        <Value>CompanyLogo</Value>
        <MIMEType>${mimeType}</MIMEType>
        <Sizing>Fit</Sizing>
        <Top>${top}</Top>
        <Left>${left}</Left>
        <Width>${widthMm}mm</Width>
        <Height>${heightMm}mm</Height>
              <ZIndex>2</ZIndex>
      </Image>`

  const embeddedImagesXml = `  <EmbeddedImages>
    <EmbeddedImage Name="CompanyLogo">
      <MIMEType>${mimeType}</MIMEType>
      <ImageData>${base64Data}</ImageData>
    </EmbeddedImage>
  </EmbeddedImages>`

  return { imageXml, embeddedImagesXml }
}

// When logo is on the right edge, move the INVOICE title / number / date block
// further left so it doesn't collide with the logo in header layouts.
function shiftInvoiceHeaderForRightLogo(rdl: string): string {
  const ids = [
    "InvoiceTitle",
    "InvoiceNumberLabel",
    "InvoiceNumber",
    "InvoiceDateLabel",
    "InvoiceDate",
  ]

  let updated = rdl

  ids.forEach((id) => {
    const pattern = new RegExp(
      `(<Textbox Name="${id}"[\\s\\S]*?<Left>)([0-9.]+)mm(</Left>)`,
      "g",
    )

    updated = updated.replace(pattern, (_, prefix: string, value: string, suffix: string) => {
      const num = parseFloat(value)
      if (Number.isNaN(num)) return `${prefix}${value}mm${suffix}`
      const shifted = Math.max(0, num - 20) // shift 20mm left
      return `${prefix}${shifted.toFixed(2)}mm${suffix}`
    })
  })

  return updated
}
