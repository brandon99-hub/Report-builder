/**
 * Template Data Injector
 * Injects user invoice data into gallery template HTML
 */

import type { InvoiceSchema } from './validation'

/**
 * Inject user data into template HTML
 */
export function injectDataIntoTemplate(
    templateHtml: string,
    schema: Partial<InvoiceSchema>,
    templateId: string
): string {
    let html = templateHtml

    // Replace company information
    html = replaceCompanyInfo(html, schema)

    // Replace customer information
    html = replaceCustomerInfo(html, schema)

    // Replace invoice details
    html = replaceInvoiceDetails(html, schema)

    // Replace invoice items
    html = replaceInvoiceItems(html, schema)

    // Replace totals
    html = replaceTotals(html, schema)

    // Replace footer/terms
    html = replaceFooter(html, schema)

    return html
}

/**
 * Replace company information in template
 */
function replaceCompanyInfo(html: string, schema: Partial<InvoiceSchema>): string {
    const companyName = schema.companyName || 'Company Name'
    const companyAddress = schema.companyAddress || ''
    const companyEmail = schema.companyEmail || ''
    const companyPhone = schema.companyPhone || ''
    const website = schema.website || ''

    // Replace using class selectors
    html = html.replace(
        /(<h2 class="our-company-name">)[^<]*(<)/,
        `$1${companyName}$2`
    )

    html = html.replace(
        /(<h6 class="our-address">)([^<]*)((?:<br>.*?)*)<\//,
        `$1${companyAddress.replace(/\n/g, '<br>')}$2`
    )

    // Replace footer contact info
    if (website) {
        html = html.replace(
            /(<h6 class="text-left">)[^<]*(<)/,
            `$1${website}$2`
        )
    }

    if (companyEmail) {
        html = html.replace(
            /(<h6 class="text-center">)[^<]*(<)/,
            `$1${companyEmail}$2`
        )
    }

    if (companyPhone) {
        html = html.replace(
            /(<h6 class="text-right">)[^<]*(<)/,
            `$1${companyPhone}$2`
        )
    }

    return html
}

/**
 * Replace customer information in template
 */
function replaceCustomerInfo(html: string, schema: Partial<InvoiceSchema>): string {
    const customerName = schema.customerName || 'Customer Name'
    const customerAddress = schema.customerAddress || ''

    html = html.replace(
        /(<h2 class="client-company-name">)[^<]*(<)/,
        `$1${customerName}$2`
    )

    html = html.replace(
        /(<h6 class="client-address">)([^<]*)((?:<br>.*?)*)<\//,
        `$1${customerAddress.replace(/\n/g, '<br>')}$2`
    )

    return html
}

/**
 * Replace invoice details (number, date, etc.)
 */
function replaceInvoiceDetails(html: string, schema: Partial<InvoiceSchema>): string {
    const invoiceNumber = schema.invoiceNumber || 'INV-001'
    const invoiceDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
    const invoiceTitle = schema.invoiceTitle || 'Invoice'

    // Replace invoice number
    html = html.replace(
        /(<h4>)[^<]*(<\/h4>[\s\S]*?<\/div>[\s\S]*?<div class="col-md-offset)/,
        `$1${invoiceNumber}$2`
    )

    // Replace invoice title
    html = html.replace(
        /(<h2 class="title">)[^<]*(<)/,
        `$1${invoiceTitle}$2`
    )

    // Replace date
    html = html.replace(
        /(<h5>)\d{2}\s\w+\s\d{4}(<)/,
        `$1${invoiceDate}$2`
    )

    return html
}

/**
 * Replace invoice items in table
 */
function replaceInvoiceItems(html: string, schema: Partial<InvoiceSchema>): string {
    const items = schema.invoiceItems || []
    const currency = schema.currency || 'KSH'

    if (items.length === 0) {
        return html
    }

    // Build item rows HTML
    const itemRows = items.map(item => {
        const qty = item.quantity || '1'
        const desc = item.description || 'Item'
        const price = item.amount || item.price || '0'
        const formattedPrice = formatCurrency(parseFloat(price), currency)

        return `
      <tr>
        <td>${qty}</td>
        <td>${desc}</td>
        <td>${formattedPrice}</td>
      </tr>
    `
    }).join('')

    // Replace tbody content
    html = html.replace(
        /(<tbody>)[\s\S]*?(<tr style="height: 40px;"><\/tr>)/,
        `$1${itemRows}$2`
    )

    return html
}

/**
 * Replace totals in template
 */
function replaceTotals(html: string, schema: Partial<InvoiceSchema>): string {
    const items = schema.invoiceItems || []
    const currency = schema.currency || 'KSH'

    // Calculate totals
    const subtotal = items.reduce((sum, item) => {
        const amount = parseFloat(item.amount || item.price || '0')
        return sum + amount
    }, 0)

    const tax = subtotal * 0.16 // 16% tax
    const total = subtotal + tax

    // Replace total in thead
    html = html.replace(
        /(<th>Total<\/th>[\s\S]*?<th>)([^<]*)(<)/,
        `$1${formatCurrency(total, currency)}$3`
    )

    return html
}

/**
 * Replace footer/terms
 */
function replaceFooter(html: string, schema: Partial<InvoiceSchema>): string {
    const notes = schema.notes || ''

    if (notes) {
        // Replace terms section
        const notesList = notes.split('\n').map(note =>
            `<li>${note.trim()}</li>`
        ).join('')

        html = html.replace(
            /(<ul>)[\s\S]*?(<\/ul>)/,
            `$1${notesList}$2`
        )
    }

    return html
}

/**
 * Format currency value
 */
function formatCurrency(value: number, currency: string): string {
    const formatted = value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })

    return `${currency} ${formatted}`
}

/**
 * Load template HTML from file
 */
export async function loadTemplateHtml(templateId: string): Promise<string> {
    const response = await fetch(`/templates/html/${templateId}.html`)
    if (!response.ok) {
        throw new Error(`Failed to load template: ${templateId}`)
    }
    return response.text()
}


