import { generateRDL, generateInvoiceNumber } from '@/lib/rdl-generator'
import type { InvoiceSchema } from '@/lib/validation'

describe('generateRDL', () => {
  const validSchema: InvoiceSchema = {
    companyName: 'Test Company',
    companyAddress: '123 Test St',
    invoiceTitle: 'Invoice',
    invoiceNumberField: 'InvoiceNo',
    invoiceDateField: 'InvoiceDate',
    customerNameField: 'CustomerName',
    itemColumns: [
      { label: 'Description', fieldName: 'Description' },
      { label: 'Quantity', fieldName: 'Quantity' },
    ],
    totals: [
      { label: 'Subtotal', fieldName: 'Subtotal' },
      { label: 'Total', fieldName: 'GrandTotal' },
    ],
  }

  it('should generate valid RDL for simple template', () => {
    const result = generateRDL('simple', validSchema)
    expect(result.success).toBe(true)
    expect(result.rdl).toBeDefined()
    expect(result.rdl).toContain('<Report')
    expect(result.rdl).toContain('Test Company')
  })

  it('should return error for invalid template', () => {
    const result = generateRDL('invalid-template', validSchema)
    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })

  it('should include company name in generated RDL', () => {
    const result = generateRDL('simple', validSchema)
    if (result.success && result.rdl) {
      expect(result.rdl).toContain('Test Company')
    }
  })
})

describe('generateInvoiceNumber', () => {
  it('should generate invoice number with correct format', () => {
    const invoiceNumber = generateInvoiceNumber()
    expect(invoiceNumber).toMatch(/^INV-\d{4}-\d{3}$/)
  })

  it('should include current year', () => {
    const invoiceNumber = generateInvoiceNumber()
    const currentYear = new Date().getFullYear()
    expect(invoiceNumber).toContain(currentYear.toString())
  })
})

