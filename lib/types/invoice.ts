// Complete Invoice Schema Types
// Includes all business fields for real-world invoice management

export interface InvoiceItem {
    id?: string
    itemCode?: string // SKU/Product ID
    description: string
    quantity: number
    unitPrice: number
    discount?: number
    taxRate?: number
    lineTotal: number
    notes?: string
}

export interface ItemColumn {
    label: string
    fieldName: string
    visible?: boolean
}

export interface TotalsRow {
    label: string
    fieldName: string
}

export interface LogoConfig {
    base64: string
    width?: number
    height?: number
    position?: 'left' | 'right'
}

export interface TemplateStyle {
    colors: {
        primary: string
        secondary: string
        text: string
        background: string
        accent?: string
    }
    fonts: {
        heading: string
        body: string
        sizes?: {
            h1?: string
            h2?: string
            body?: string
        }
    }
    layout: 'modern' | 'classic' | 'minimal' | 'corporate'
    borders?: {
        width: string
        color: string
        style: 'solid' | 'dashed' | 'dotted'
    }
}

export interface InvoiceSchema {
    // Identity
    invoiceNumber?: string
    referenceNumber?: string

    // Company Information
    companyName: string
    companyAddress: string
    companyEmail?: string
    companyPhone?: string
    website?: string
    vatRegistrationNumber?: string
    companyTaxId?: string
    branchCode?: string

    // Customer Information
    customerId?: string
    customerName: string
    customerCompany?: string
    billingAddress: string
    shippingAddress?: string
    customerEmail?: string
    customerPhone?: string
    customerTaxId?: string

    // Dates
    invoiceDate: string
    dueDate?: string
    issueDate?: string
    paymentDate?: string

    // Business Fields
    purchaseOrderNumber?: string
    projectId?: string
    salespersonId?: string
    glAccountId?: string

    // Invoice Items
    invoiceItems: InvoiceItem[]
    itemColumns: ItemColumn[]

    // Totals Configuration
    totals: TotalsRow[]

    // Financial Details
    currency: string // Default: 'KSH'
    exchangeRate?: number
    subtotal: number
    discountAmount?: number
    taxAmount: number
    totalAmount: number
    amountPaid?: number
    balanceDue?: number

    // Payment Information
    paymentMethod?: string
    paymentReference?: string // MPesa code, bank ref, etc.
    paymentStatus?: 'pending' | 'partial' | 'paid' | 'overdue'

    // Content
    notes?: string
    termsConditions?: string

    // Template Configuration
    invoiceTitle: string
    logo?: LogoConfig
    templateStyle?: TemplateStyle

    // Column Visibility (NEW!)
    visibleColumns?: string[] // IDs of columns to display

    // Recurring Invoice
    isRecurring?: boolean
    recurrenceInterval?: 'weekly' | 'monthly' | 'quarterly' | 'yearly'

    // Status
    status?: 'draft' | 'issued' | 'sent' | 'paid' | 'overdue' | 'cancelled'
}

// Master list of all available invoice columns
export const AVAILABLE_INVOICE_COLUMNS: ItemColumn[] = [
    { label: 'Item Code', fieldName: 'itemCode', visible: false },
    { label: 'Description', fieldName: 'description', visible: true },
    { label: 'Quantity', fieldName: 'quantity', visible: true },
    { label: 'Unit Price', fieldName: 'unitPrice', visible: true },
    { label: 'Discount', fieldName: 'discount', visible: false },
    { label: 'Tax Rate', fieldName: 'taxRate', visible: false },
    { label: 'Line Total', fieldName: 'lineTotal', visible: true },
    { label: 'Notes', fieldName: 'notes', visible: false },
]

// Currency formatter for KSH and other currencies
export function formatCurrency(amount: number, currency: string = 'KSH'): string {
    const locale = currency === 'KSH' ? 'en-KE' : 'en-US'

    try {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount)
    } catch (error) {
        // Fallback for unsupported currencies
        return `${currency} ${amount.toFixed(2)}`
    }
}

// Supported currencies
export const SUPPORTED_CURRENCIES = [
    { code: 'KSH', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh' },
    { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh' },
]

// Default template styles for original 3 templates
export const DEFAULT_TEMPLATE_STYLES: Record<string, TemplateStyle> = {
    simple: {
        colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            text: '#1e293b',
            background: '#ffffff',
        },
        fonts: {
            heading: 'Arial, sans-serif',
            body: 'Arial, sans-serif',
            sizes: {
                h1: '24pt',
                h2: '18pt',
                body: '10pt',
            },
        },
        layout: 'minimal',
        borders: {
            width: '1pt',
            color: '#e2e8f0',
            style: 'solid',
        },
    },
    modern: {
        colors: {
            primary: '#8b5cf6',
            secondary: '#a78bfa',
            text: '#1e293b',
            background: '#ffffff',
            accent: '#f59e0b',
        },
        fonts: {
            heading: 'Segoe UI, sans-serif',
            body: 'Segoe UI, sans-serif',
            sizes: {
                h1: '28pt',
                h2: '20pt',
                body: '11pt',
            },
        },
        layout: 'modern',
        borders: {
            width: '2pt',
            color: '#8b5cf6',
            style: 'solid',
        },
    },
    corporate: {
        colors: {
            primary: '#0f172a',
            secondary: '#475569',
            text: '#334155',
            background: '#ffffff',
        },
        fonts: {
            heading: 'Times New Roman, serif',
            body: 'Arial, sans-serif',
            sizes: {
                h1: '26pt',
                h2: '18pt',
                body: '10pt',
            },
        },
        layout: 'corporate',
        borders: {
            width: '1pt',
            color: '#cbd5e1',
            style: 'solid',
        },
    },
}
