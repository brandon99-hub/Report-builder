export interface ValidationError {
  line?: number
  column?: number
  message: string
  severity: "error" | "warning"
  suggestion?: string
}

export function validateRDLXml(xmlContent: string): ValidationError[] {
  const errors: ValidationError[] = []

  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlContent, "text/xml")

    // Check for parser errors
    const parserErrors = xmlDoc.querySelectorAll("parsererror")
    if (parserErrors.length > 0) {
      parserErrors.forEach((error) => {
        const errorText = error.textContent || "XML parsing error"
        const lineMatch = errorText.match(/line (\d+)/i)
        const line = lineMatch ? parseInt(lineMatch[1]) : undefined

        errors.push({
          line,
          message: errorText,
          severity: "error",
          suggestion: "Check XML syntax and ensure all tags are properly closed",
        })
      })
      return errors
    }

    // Validate root element
    if (xmlDoc.documentElement.tagName !== "Report") {
      errors.push({
        message: "Root element must be 'Report'",
        severity: "error",
        suggestion: "Ensure the XML starts with <Report> tag",
      })
    }

    // Check for required SSRS 2016 structure
    if (!xmlDoc.querySelector("ReportSections")) {
      errors.push({
        message: "Missing ReportSections element (required for SSRS 2016)",
        severity: "error",
        suggestion: "Wrap Body in <ReportSections><ReportSection>...</ReportSection></ReportSections>",
      })
    }

    // Check for Body inside ReportSection
    const reportSections = xmlDoc.querySelectorAll("ReportSection")
    reportSections.forEach((section, idx) => {
      if (!section.querySelector("Body")) {
        errors.push({
          message: `ReportSection ${idx + 1} is missing Body element`,
          severity: "error",
          suggestion: "Add <Body> element inside ReportSection",
        })
      }
    })

    // Validate Textbox structure (SSRS 2016 requires Paragraphs)
    const textboxes = xmlDoc.querySelectorAll("Textbox")
    textboxes.forEach((textbox, idx) => {
      const hasParagraphs = textbox.querySelector("Paragraphs")
      const hasDirectValue = textbox.querySelector("Value") && !hasParagraphs

      if (hasDirectValue) {
        errors.push({
          message: `Textbox ${idx + 1}: Value must be inside Paragraphs structure (SSRS 2016 requirement)`,
          severity: "error",
          suggestion: "Wrap Value in <Paragraphs><Paragraph><TextRuns><TextRun>...</TextRun></TextRuns></Paragraph></Paragraphs>",
        })
      }
    })

    // Check for color format (must have # prefix)
    const colorElements = xmlDoc.querySelectorAll("Color")
    colorElements.forEach((color, idx) => {
      const value = color.textContent?.trim() || ""
      if (value && !value.startsWith("#") && value !== "Transparent") {
        errors.push({
          message: `Color value must include # prefix: ${value}`,
          severity: "warning",
          suggestion: `Change to #${value}`,
        })
      }
    })

    // Validate Tablix structure
    const tablixes = xmlDoc.querySelectorAll("Tablix")
    tablixes.forEach((tablix, idx) => {
      if (!tablix.querySelector("TablixBody")) {
        errors.push({
          message: `Tablix ${idx + 1}: Missing TablixBody`,
          severity: "error",
          suggestion: "Add TablixBody element with TablixColumns and TablixRows",
        })
      }

      if (!tablix.querySelector("TablixRowHierarchy")) {
        errors.push({
          message: `Tablix ${idx + 1}: Missing TablixRowHierarchy (required for SSRS 2016)`,
          severity: "error",
          suggestion: "Add TablixRowHierarchy as direct child of Tablix",
        })
      }

      if (!tablix.querySelector("TablixColumnHierarchy")) {
        errors.push({
          message: `Tablix ${idx + 1}: Missing TablixColumnHierarchy (required for SSRS 2016)`,
          severity: "error",
          suggestion: "Add TablixColumnHierarchy as direct child of Tablix",
        })
      }
    })

    // Check for EmbeddedImages placement
    const embeddedImages = xmlDoc.querySelector("EmbeddedImages")
    if (embeddedImages) {
      const reportSections = xmlDoc.querySelector("ReportSections")
      if (reportSections && embeddedImages.compareDocumentPosition(reportSections) & Node.DOCUMENT_POSITION_FOLLOWING) {
        errors.push({
          message: "EmbeddedImages must be placed before ReportSections",
          severity: "error",
          suggestion: "Move EmbeddedImages element before ReportSections",
        })
      }
    }

  } catch (error) {
    errors.push({
      message: error instanceof Error ? error.message : "Unknown validation error",
      severity: "error",
    })
  }

  return errors
}

export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return "✓ No validation errors found"
  }

  const errorCount = errors.filter((e) => e.severity === "error").length
  const warningCount = errors.filter((e) => e.severity === "warning").length

  let output = `Validation Results:\n`
  output += `Errors: ${errorCount}, Warnings: ${warningCount}\n\n`

  errors.forEach((error, idx) => {
    output += `${idx + 1}. [${error.severity.toUpperCase()}]`
    if (error.line) {
      output += ` Line ${error.line}`
      if (error.column) {
        output += `, Column ${error.column}`
      }
    }
    output += `: ${error.message}\n`
    if (error.suggestion) {
      output += `   💡 ${error.suggestion}\n`
    }
    output += `\n`
  })

  return output
}

