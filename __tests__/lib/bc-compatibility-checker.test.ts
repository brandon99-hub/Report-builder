import { checkBCCompatibility, generateCompatibilityReport } from "@/lib/bc-compatibility-checker"

const validRdl = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition">
  <DataSources>
    <DataSource Name="DataSource1" />
  </DataSources>
  <DataSets>
    <DataSet Name="DataSet1">
      <Fields>
        <Field Name="InvoiceNo" />
        <Field Name="InvoiceDate" />
        <Field Name="CustomerName" />
      </Fields>
    </DataSet>
  </DataSets>
</Report>`

const invalidFieldRdl = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition">
  <DataSources>
    <DataSource Name="DataSource1" />
  </DataSources>
  <DataSets>
    <DataSet Name="DataSet1">
      <Fields>
        <Field Name="Invoice-No" />
      </Fields>
    </DataSet>
  </DataSets>
</Report>`

describe("bc-compatibility-checker", () => {
  it("detects no critical issues for a minimal valid RDL", () => {
    const issues = checkBCCompatibility(validRdl)
    const errors = issues.filter((i) => i.severity === "error")
    expect(errors.length).toBe(0)
    const report = generateCompatibilityReport(issues)
    expect(typeof report).toBe("string")
  })

  it("flags invalid field names", () => {
    const issues = checkBCCompatibility(invalidFieldRdl)
    const invalidFieldIssue = issues.find((i) => i.code === "INVALID_FIELD_NAME")
    expect(invalidFieldIssue).toBeDefined()
  })

  it("returns parse error for malformed XML", () => {
    const issues = checkBCCompatibility("<Invalid>")
    const parseError = issues.find((i) => i.code === "PARSE_ERROR")
    expect(parseError).toBeDefined()
  })
})


