import { parseRDL, extractFieldNames } from '@/lib/rdl-parser'

const sampleRDL = `<?xml version="1.0" encoding="utf-8"?>
<Report>
  <Title>Test Invoice</Title>
  <DataSources>
    <DataSource Name="DataSource1">
      <ConnectionProperties>
        <DataProvider>SQL</DataProvider>
      </ConnectionProperties>
    </DataSource>
  </DataSources>
  <DataSets>
    <DataSet Name="DataSet1">
      <Fields>
        <Field Name="InvoiceNo" DataField="InvoiceNo" />
        <Field Name="InvoiceDate" DataField="InvoiceDate" />
        <Field Name="CustomerName" DataField="CustomerName" />
      </Fields>
    </DataSet>
  </DataSets>
  <ReportSections>
    <ReportSection>
      <Body>
        <Height>0cm</Height>
        <ReportItems>
          <Textbox Name="CompanyName">
            <Paragraphs>
              <Paragraph>
                <TextRuns>
                  <TextRun>
                    <Value>Test Company</Value>
                  </TextRun>
                </TextRuns>
              </Paragraph>
            </Paragraphs>
          </Textbox>
        </ReportItems>
      </Body>
    </ReportSection>
  </ReportSections>
</Report>`

describe('parseRDL', () => {
  it('should parse valid RDL XML', () => {
    const result = parseRDL(sampleRDL)
    expect(result.success).toBe(true)
    expect(result.data).toBeDefined()
    expect(result.data?.metadata.reportTitle).toBe('Test Invoice')
  })

  it('should extract company name from textbox', () => {
    const result = parseRDL(sampleRDL)
    if (result.success && result.data) {
      expect(result.data.schema.companyName).toBe('Test Company')
    }
  })

  it('should extract datasets and fields', () => {
    const result = parseRDL(sampleRDL)
    if (result.success && result.data) {
      expect(result.data.datasets).toBeDefined()
      expect(result.data.datasets?.[0].fields.length).toBeGreaterThan(0)
    }
  })

  it('should return error for invalid XML', () => {
    const result = parseRDL('<Invalid>XML</Invalid>')
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })

  it('should return error for non-RDL file', () => {
    const result = parseRDL('<NotReport></NotReport>')
    expect(result.success).toBe(false)
  })
})

describe('extractFieldNames', () => {
  it('should extract field names from RDL', () => {
    const fields = extractFieldNames(sampleRDL)
    expect(fields).toContain('InvoiceNo')
    expect(fields).toContain('InvoiceDate')
    expect(fields).toContain('CustomerName')
  })

  it('should return empty array for invalid XML', () => {
    const fields = extractFieldNames('invalid xml')
    expect(fields).toEqual([])
  })
})

