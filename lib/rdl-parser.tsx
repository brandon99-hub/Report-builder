import type { InvoiceSchema, ItemColumn, InvoiceColumn, TotalsRow } from "./validation"

export interface ParsedRDL {
  schema: InvoiceSchema
  metadata: {
    reportTitle: string
    description: string
    author?: string
  }
  datasets?: Array<{
    name: string
    fields: Array<{
      name: string
      dataField: string
      dataType?: string
    }>
    query?: string
  }>
  parameters?: Array<{
    name: string
    dataType: string
    prompt?: string
    defaultValue?: string
  }>
  rawXml: string
}

export interface RDLParseError {
  code: string
  message: string
  line?: number
}

// Parse RDL XML to extract schema and structure
export function parseRDL(xmlContent: string): { success: boolean; data?: ParsedRDL; errors?: RDLParseError[] } {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml")

    // Check for parse errors
    if (xmlDoc.getElementsByTagName("parsererror").length > 0) {
      return {
        success: false,
        errors: [{ code: "INVALID_XML", message: "Invalid XML format" }],
      }
    }

    // Extract report properties
    const reportElement = xmlDoc.documentElement
    if (reportElement.tagName !== "Report") {
      return {
        success: false,
        errors: [{ code: "NOT_RDL", message: "File is not a valid RDL report" }],
      }
    }

    // Extract metadata
    const reportTitle = xmlDoc.querySelector("Title")?.textContent || "Invoice Report"
    const description = xmlDoc.querySelector("Description")?.textContent || ""
    const author = xmlDoc.querySelector("Author")?.textContent

    // Extract company name and address from Textbox elements
    // Enhanced to handle SSRS 2016 Paragraphs structure
    let companyName = ""
    let companyAddress = ""
    const textboxes = xmlDoc.querySelectorAll("Textbox")
    textboxes.forEach((textbox) => {
      const name = textbox.getAttribute("Name")
      
      // Handle SSRS 2016 Paragraphs structure
      const paragraph = textbox.querySelector("Paragraph")
      const textRun = paragraph?.querySelector("TextRun")
      const valueElement = textRun?.querySelector("Value") || textbox.querySelector("Value")
      const value = valueElement?.textContent?.trim() || textbox.textContent?.trim() || ""
      
      // Look for company name in header textboxes
      if (name && (name.includes("CompanyHeader") || name.includes("CompanyName") || name.includes("CorpCompanyName"))) {
        if (value && !value.startsWith("=") && !value.startsWith("Fields!")) {
          companyName = value
        } else if (value.startsWith("Fields!")) {
          // Extract field name from expression
          const fieldMatch = value.match(/Fields!(\w+)\.Value/i)
          if (fieldMatch) {
            companyName = fieldMatch[1] // Use field name as fallback
          }
        }
      }
      // Look for company address
      if (name && (name.includes("CompanyAddress") || name.includes("CorpAddress"))) {
        if (value && !value.startsWith("=") && !value.startsWith("Fields!")) {
          companyAddress = value.replace(/&#x0A;/g, "\n") // Convert XML line breaks
        } else if (value.startsWith("Fields!")) {
          // Extract field name from expression
          const fieldMatch = value.match(/Fields!(\w+)\.Value/i)
          if (fieldMatch) {
            companyAddress = fieldMatch[1] // Use field name as fallback
          }
        }
      }
    })

    // Extract datasets and fields with enhanced information
    const datasetElements = xmlDoc.querySelectorAll("Dataset")
    const parsedDatasets: Array<{
      name: string
      fields: Array<{ name: string; dataField: string; dataType?: string }>
      query?: string
    }> = []
    const dataFields: string[] = []

    datasetElements.forEach((dataset) => {
      const datasetName = dataset.getAttribute("Name") || "DataSet1"
      const fields: Array<{ name: string; dataField: string; dataType?: string }> = []
      
      dataset.querySelectorAll("Field").forEach((field) => {
        const name = field.getAttribute("Name")
        const dataField = field.getAttribute("DataField") || name || ""
        const dataType = field.getAttribute("DataType")
        
        if (name) {
          dataFields.push(name)
          fields.push({ name, dataField, dataType: dataType || undefined })
        }
      })
      
      // Extract query if available
      const queryElement = dataset.querySelector("Query > CommandText")
      const query = queryElement?.textContent?.trim()
      
      parsedDatasets.push({
        name: datasetName,
        fields,
        query,
      })
    })

    // Extract parameters
    const parameterElements = xmlDoc.querySelectorAll("ReportParameter")
    const parsedParameters: Array<{
      name: string
      dataType: string
      prompt?: string
      defaultValue?: string
    }> = []

    parameterElements.forEach((param) => {
      const name = param.getAttribute("Name")
      const dataType = param.getAttribute("DataType") || "String"
      const prompt = param.querySelector("Prompt")?.textContent?.trim()
      const defaultValue = param.querySelector("DefaultValue > Values > Value")?.textContent?.trim()
      
      if (name) {
        parsedParameters.push({
          name,
          dataType,
          prompt,
          defaultValue,
        })
      }
    })

    // Extract Tablix (table) structure with enhanced parsing
    const tablixElements = xmlDoc.querySelectorAll("Tablix")
    const invoiceColumns: InvoiceColumn[] = []
    const itemColumns: ItemColumn[] = []
    const totalsRows: TotalsRow[] = []

    tablixElements.forEach((tablix) => {
      const tablixName = tablix.getAttribute("Name") || ""
      
      // Look for TablixBody which contains the actual structure
      const tablixBody = tablix.querySelector("TablixBody")
      if (tablixBody) {
        // Extract column headers from TablixRows
        const tablixRows = tablixBody.querySelectorAll("TablixRow")
        if (tablixRows.length > 0) {
          // First row is typically the header
          const headerRow = tablixRows[0]
          const headerCells = headerRow.querySelectorAll("TablixCell")
          
          headerCells.forEach((cell, idx) => {
            // Look for Textbox in CellContents or directly in TablixCell
            const cellContents = cell.querySelector("CellContents")
            const textbox = (cellContents || cell).querySelector("Textbox")
            
            if (textbox) {
              // Handle SSRS 2016 Paragraphs structure
              const paragraph = textbox.querySelector("Paragraph")
              const textRun = paragraph?.querySelector("TextRun")
              const valueElement = textRun?.querySelector("Value") || textbox.querySelector("Value")
              
              let text = valueElement?.textContent?.trim() || textbox.textContent?.trim() || `Column ${idx + 1}`
              
              // Extract field reference if it's an expression
              const fieldMatch = text.match(/Fields!(\w+)\.Value/i)
              const fieldName = fieldMatch ? fieldMatch[1] : ""
              
              // Clean up text (remove expressions, keep labels)
              if (text.startsWith("=") || text.startsWith("Fields!")) {
                // It's an expression, try to extract a meaningful label
                text = fieldName || `Column ${idx + 1}`
              }
              
              if (text) {
                itemColumns.push({
                  name: text,
                  fieldName: fieldName || text.replace(/[^a-zA-Z0-9]/g, ""),
                  isVisible: true,
                })
              }
            }
          })
        }
      }
      
      // Also check TablixHeader for older RDL formats
      const tablixHeader = tablix.querySelector("TablixHeader")
      if (tablixHeader && itemColumns.length === 0) {
        const headerRows = tablixHeader.querySelectorAll("TablixRow")
        if (headerRows.length > 0) {
          const headerRow = headerRows[0]
          const cells = headerRow.querySelectorAll("TablixCell")
          cells.forEach((cell, idx) => {
            const textboxes = cell.querySelectorAll("Textbox")
            if (textboxes.length > 0) {
              const valueElement = textboxes[0].querySelector("Value")
              const text = valueElement?.textContent?.trim() || textboxes[0].textContent?.trim() || `Column ${idx}`
              if (text) {
                itemColumns.push({
                  name: text,
                  isVisible: true,
                })
              }
            }
          })
        }
      }
    })

    // Extract totals from Textbox elements (totals are separate, not in Tablix)
    // Enhanced to handle SSRS 2016 Paragraphs structure
    const allTextboxes = xmlDoc.querySelectorAll("Textbox")
    allTextboxes.forEach((textbox) => {
      const name = textbox.getAttribute("Name")
      if (name && (name.startsWith("TotalLabel_") || name.startsWith("Total_") || name.toLowerCase().includes("total"))) {
        // Handle SSRS 2016 Paragraphs structure
        const paragraph = textbox.querySelector("Paragraph")
        const textRun = paragraph?.querySelector("TextRun")
        const valueElement = textRun?.querySelector("Value") || textbox.querySelector("Value")
        
        const value = valueElement?.textContent?.trim() || textbox.textContent?.trim() || ""
        // Remove the colon if present and clean up
        let label = value.replace(/:\s*$/, "").replace(/^=/, "").trim()
        
        // Extract field reference if it's an expression
        const fieldMatch = label.match(/Fields!(\w+)\.Value/i)
        if (fieldMatch) {
          label = fieldMatch[1] // Use field name as label
        }
        
        if (label && (label.toLowerCase().includes("total") || label.toLowerCase().includes("subtotal") || label.toLowerCase().includes("tax") || label.toLowerCase().includes("grand"))) {
          // Check if we already added this total
          if (!totalsRows.find((t) => t.label === label)) {
            totalsRows.push({
              label,
              isVisible: true,
            })
          }
        }
      }
    })

    const schema: InvoiceSchema = {
      companyName: companyName || "Parsed Company",
      companyAddress: companyAddress || "",
      invoiceTitle: reportTitle,
      invoiceNumberField: "",
      invoiceDateField: "",
      customerNameField: "",
      itemColumns: [],
      totals: [],
      invoiceColumns,
      totalsRows,
    }

    return {
      success: true,
      data: {
        schema,
        metadata: {
          reportTitle,
          description,
          author,
        },
        datasets: parsedDatasets.length > 0 ? parsedDatasets : undefined,
        parameters: parsedParameters.length > 0 ? parsedParameters : undefined,
        rawXml: xmlContent,
      },
    }
  } catch (error) {
    return {
      success: false,
      errors: [
        {
          code: "PARSE_ERROR",
          message: error instanceof Error ? error.message : "Failed to parse RDL",
        },
      ],
    }
  }
}

// Extract field names from RDL for validation
export function extractFieldNames(xmlContent: string): string[] {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml")
    const fields: string[] = []

    xmlDoc.querySelectorAll("Field").forEach((field) => {
      const name = field.getAttribute("Name")
      if (name) fields.push(name)
    })

    return fields
  } catch {
    return []
  }
}
