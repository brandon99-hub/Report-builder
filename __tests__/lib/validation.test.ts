import { validateInvoiceSchema, sanitizeFieldName } from '@/lib/validation'
import type { InvoiceSchema } from '@/lib/validation'

describe('validateInvoiceSchema', () => {
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

  it('should validate a correct schema', () => {
    const errors = validateInvoiceSchema(validSchema)
    expect(errors).toHaveLength(0)
  })

  it('should return error for missing company name', () => {
    const schema = { ...validSchema, companyName: '' }
    const errors = validateInvoiceSchema(schema)
    expect(errors.some(e => e.field === 'companyName')).toBe(true)
  })

  it('should return error for missing invoice number field', () => {
    const schema = { ...validSchema, invoiceNumberField: '' }
    const errors = validateInvoiceSchema(schema)
    expect(errors.some(e => e.field === 'invoiceNumberField')).toBe(true)
  })

  it('should return error for empty item columns', () => {
    const schema = { ...validSchema, itemColumns: [] }
    const errors = validateInvoiceSchema(schema)
    expect(errors.some(e => e.field === 'itemColumns')).toBe(true)
  })

  it('should return error for duplicate field names', () => {
    const schema = {
      ...validSchema,
      itemColumns: [
        { label: 'Description', fieldName: 'Description' },
        { label: 'Description 2', fieldName: 'Description' },
      ],
    }
    const errors = validateInvoiceSchema(schema)
    expect(errors.some(e => e.message.includes('unique'))).toBe(true)
  })
})

describe('sanitizeFieldName', () => {
  it('should remove special characters', () => {
    expect(sanitizeFieldName('Test-Field Name!')).toBe('Test_Field_Name_')
  })

  it('should limit length to 128 characters', () => {
    const longName = 'a'.repeat(200)
    expect(sanitizeFieldName(longName).length).toBe(128)
  })

  it('should preserve valid characters', () => {
    expect(sanitizeFieldName('ValidFieldName123')).toBe('ValidFieldName123')
  })
})

