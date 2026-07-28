export interface CalculatedField {
  id: string
  name: string
  formula: string
  dataType: "currency" | "number" | "percentage"
  description?: string
}

export interface FormulaContext {
  fields: string[]
  functions: FormulaFunction[]
  operators: string[]
}

export interface FormulaFunction {
  name: string
  description: string
  syntax: string
  example: string
}

const RDLEX_FUNCTIONS: FormulaFunction[] = [
  {
    name: "Sum",
    description: "Sum of field values",
    syntax: "Sum(Fields!fieldName.Value)",
    example: "Sum(Fields!Quantity.Value) * Sum(Fields!UnitPrice.Value)",
  },
  {
    name: "Avg",
    description: "Average of values",
    syntax: "Avg(Fields!fieldName.Value)",
    example: "Avg(Fields!LineAmount.Value)",
  },
  {
    name: "Count",
    description: "Count of rows",
    syntax: "Count()",
    example: "Count()",
  },
  {
    name: "IIf",
    description: "Conditional logic",
    syntax: "IIf(condition, trueValue, falseValue)",
    example: "IIf(Fields!Quantity.Value > 100, Fields!Quantity.Value * 0.9, Fields!Quantity.Value)",
  },
  {
    name: "CDec",
    description: "Convert to decimal",
    syntax: "CDec(expression)",
    example: "CDec(Fields!Amount.Value)",
  },
  {
    name: "Format",
    description: "Format a value",
    syntax: "Format(value, format)",
    example: 'Format(Fields!Amount.Value, "C2")',
  },
]

export function validateFormula(formula: string): { valid: boolean; error?: string } {
  if (!formula || formula.trim().length === 0) {
    return { valid: false, error: "Formula cannot be empty" }
  }

  // Basic validation: check for balanced parentheses
  let parenCount = 0
  for (const char of formula) {
    if (char === "(") parenCount++
    if (char === ")") parenCount--
    if (parenCount < 0) {
      return { valid: false, error: "Unbalanced parentheses" }
    }
  }

  if (parenCount !== 0) {
    return { valid: false, error: "Unbalanced parentheses" }
  }

  // Check for valid field references
  const fieldPattern = /Fields![\w.]+\.Value/g
  const matches = formula.match(fieldPattern) || []
  if (matches.length === 0 && !formula.includes("Count()")) {
    // Allow formulas without field references for certain functions
    if (
      !formula.includes("Sum(") &&
      !formula.includes("Avg(") &&
      !formula.includes("IIf(") &&
      !formula.includes("CDec(")
    ) {
      return { valid: false, error: "Formula must reference at least one field" }
    }
  }

  return { valid: true }
}

export function convertFormulaToRDL(calculatedField: CalculatedField): string {
  // Formula is already in RDL expression format
  return `=${calculatedField.formula}`
}

export function getFormulaContext(availableFields: string[]): FormulaContext {
  return {
    fields: availableFields,
    functions: RDLEX_FUNCTIONS,
    operators: ["+", "-", "*", "/", ">", "<", ">=", "<=", "=", "<>", "And", "Or", "Not"],
  }
}

export function buildCalculatedFieldXml(field: CalculatedField, position?: { top: string; left: string; width: string; height: string }): string {
  const rdlExpression = convertFormulaToRDL(field)
  const format = getFormatForDataType(field.dataType)
  const pos = position || { top: "0mm", left: "0mm", width: "50mm", height: "6mm" }
  
  // Escape the field name for XML
  const safeName = field.name.replace(/[^a-zA-Z0-9_]/g, "_")
  
  return `<Textbox Name="Calc_${safeName}">
        <Paragraphs>
          <Paragraph>
            <TextRuns>
              <TextRun>
                <Value>${rdlExpression}</Value>
                <Style>
                  <FontSize>10pt</FontSize>
                  <Color>#1f2937</Color>
                  ${format ? `<Format>${format}</Format>` : ""}
                </Style>
              </TextRun>
            </TextRuns>
          </Paragraph>
        </Paragraphs>
        <Style>
          <TextAlign>Right</TextAlign>
          <FontSize>10pt</FontSize>
          <Color>#1f2937</Color>
          ${format ? `<Format>${format}</Format>` : ""}
          <TopBorder>
            <Style>Solid</Style>
            <Width>1pt</Width>
            <Color>#e5e7eb</Color>
          </TopBorder>
          <BottomBorder>
            <Style>Solid</Style>
            <Width>1pt</Width>
            <Color>#e5e7eb</Color>
          </BottomBorder>
          <LeftBorder>
            <Style>Solid</Style>
            <Width>1pt</Width>
            <Color>#e5e7eb</Color>
          </LeftBorder>
          <RightBorder>
            <Style>Solid</Style>
            <Width>1pt</Width>
            <Color>#e5e7eb</Color>
          </RightBorder>
          <BackgroundColor>#ffffff</BackgroundColor>
          <PaddingLeft>4mm</PaddingLeft>
          <PaddingRight>4mm</PaddingRight>
          <PaddingTop>3mm</PaddingTop>
          <PaddingBottom>3mm</PaddingBottom>
        </Style>
        <Top>${pos.top}</Top>
        <Left>${pos.left}</Left>
        <Width>${pos.width}</Width>
        <Height>${pos.height}</Height>
      </Textbox>`
}

function getFormatForDataType(dataType: string): string {
  switch (dataType) {
    case "currency":
      return "KSH #,##0.00"
    case "percentage":
      return "0.00%"
    case "number":
      return "#,##0.00"
    default:
      return ""
  }
}
