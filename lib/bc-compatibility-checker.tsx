export interface CompatibilityIssue {
  severity: "error" | "warning" | "info"
  code: string
  message: string
  field?: string
  suggestion?: string
}

export function checkBCCompatibility(rdlXml: string): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = []

  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(rdlXml, "text/xml")

    // Check 1: Verify Report ID exists (required for BC)
    if (!xmlDoc.querySelector("Report")?.getAttribute("xmlns")) {
      issues.push({
        severity: "error",
        code: "MISSING_XMLNS",
        message: "Report must have xmlns attribute for Business Central",
        suggestion: 'Ensure xmlns="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition"',
      })
    }

    // Check 2: Validate DataSource configuration
    const dataSources = xmlDoc.querySelectorAll("DataSource")
    if (dataSources.length === 0) {
      issues.push({
        severity: "error",
        code: "NO_DATASOURCE",
        message: "Report must have at least one DataSource configured",
        suggestion: "Add a DataSource connecting to your Business Central database",
      })
    }

    // Check 3: Validate field names (BC conventions)
    const fields = xmlDoc.querySelectorAll("Field")
    const fieldNames = new Set<string>()
    fields.forEach((field) => {
      const name = field.getAttribute("Name")
      if (name) {
        fieldNames.add(name)
        // Check field naming conventions
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
          issues.push({
            severity: "warning",
            code: "INVALID_FIELD_NAME",
            message: `Field name "${name}" doesn't follow BC naming conventions`,
            field: name,
            suggestion: "Use alphanumeric characters and underscores only, starting with letter or underscore",
          })
        }
      }
    })

    // Check 4: Validate Tablix width (must fit printable area)
    const tablixElements = xmlDoc.querySelectorAll("Tablix")
    tablixElements.forEach((tablix, idx) => {
      const width = tablix.querySelector("Width")?.textContent
      if (width) {
        const widthValue = Number.parseFloat(width)
        if (widthValue > 180) {
          // 180mm is safe printable width for A4
          issues.push({
            severity: "warning",
            code: "TABLIX_WIDTH_EXCEEDS",
            message: `Tablix ${idx + 1} width (${width}) may exceed printable area`,
            suggestion: "Reduce width to less than 180mm for safe printing",
          })
        }
      }
    })

    // Check 5: Validate expressions
    const textboxes = xmlDoc.querySelectorAll("Textbox")
    textboxes.forEach((textbox) => {
      const value = textbox.querySelector("Value")?.textContent
      if (value && value.includes("=Fields!")) {
        // Check for unsupported functions in BC
        const unsupportedFunctions = ["RowNumber", "Previous", "InScope", "Aggregate"]
        unsupportedFunctions.forEach((func) => {
          if (value.includes(func)) {
            issues.push({
              severity: "warning",
              code: "UNSUPPORTED_FUNCTION",
              message: `Function "${func}" may not be fully supported in Business Central`,
              suggestion: `Consider using alternative BC-compatible expressions`,
            })
          }
        })
      }
    })

    // Check 6: Validate report size (page dimensions)
    const width = xmlDoc.querySelector("Width")?.textContent
    const height = xmlDoc.querySelector("Height")?.textContent
    if (width && height) {
      if (!width.endsWith("cm") || !height.endsWith("cm")) {
        issues.push({
          severity: "info",
          code: "UNIT_RECOMMENDATION",
          message: "Report dimensions use non-metric units",
          suggestion: "Consider using cm (centimeters) for better compatibility",
        })
      }
    }

    // Check 7: Verify required fields for invoice
    const requiredInvoiceFields = ["InvoiceNo", "InvoiceDate", "CustomerName"]
    requiredInvoiceFields.forEach((required) => {
      if (!fieldNames.has(required)) {
        issues.push({
          severity: "warning",
          code: "MISSING_STANDARD_FIELD",
          message: `Standard invoice field "${required}" not found`,
          suggestion: `Add field "${required}" to match BC invoice template conventions`,
        })
      }
    })
  } catch (error) {
    issues.push({
      severity: "error",
      code: "PARSE_ERROR",
      message: "Failed to validate RDL compatibility",
      suggestion: "Ensure RDL XML is well-formed",
    })
  }

  return issues
}

export function generateCompatibilityReport(issues: CompatibilityIssue[]): string {
  const errors = issues.filter((i) => i.severity === "error").length
  const warnings = issues.filter((i) => i.severity === "warning").length
  const infos = issues.filter((i) => i.severity === "info").length

  let report = `Business Central Compatibility Report\n`
  report += `====================================\n\n`
  report += `Errors: ${errors} | Warnings: ${warnings} | Info: ${infos}\n\n`

  if (errors > 0) {
    report += `ERRORS:\n`
    issues
      .filter((i) => i.severity === "error")
      .forEach((issue) => {
        report += `  - [${issue.code}] ${issue.message}\n`
        if (issue.suggestion) report += `    Suggestion: ${issue.suggestion}\n`
      })
    report += `\n`
  }

  if (warnings > 0) {
    report += `WARNINGS:\n`
    issues
      .filter((i) => i.severity === "warning")
      .forEach((issue) => {
        report += `  - [${issue.code}] ${issue.message}\n`
        if (issue.suggestion) report += `    Suggestion: ${issue.suggestion}\n`
      })
    report += `\n`
  }

  return report
}
