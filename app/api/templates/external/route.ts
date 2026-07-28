import { NextResponse } from 'next/server'

// GitHub repository configuration
const GITHUB_REPO = 'invoice-report-builder/templates'
const GITHUB_BRANCH = 'main'
const TEMPLATES_INDEX_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/index.json`

// Fallback templates based on nirajrajgor/html-invoice-templates (MIT License)
// Source: https://github.com/nirajrajgor/html-invoice-templates
const FALLBACK_TEMPLATES = [
    {
        id: 'professional-blue-001',
        name: 'Professional Blue Invoice',
        description: 'Clean and professional design with blue accents, perfect for corporate use',
        category: 'professional',
        tags: ['professional', 'corporate', 'blue', 'clean'],
        author: 'Niraj Rajgor (Adapted)',
        version: '1.0.0',
        thumbnail: '/templates/screenshots/professional-blue-001.png',
        previewUrl: 'https://nirajrajgor.github.io/html-invoice-templates/invoice1/invoice1.html',
        schema: {
            companyName: 'Google Inc.',
            companyAddress: '31 Lake Floyd Circle, Delaware, AC 987869',
            companyEmail: 'contact@acme.com',
            companyPhone: '+91 8097678988',
            website: 'acme.com',
            invoiceTitle: 'Invoice',
            customerName: 'Acme LLP',
            customerAddress: '477 Blackwell Street, Dry Creek, Alaska',
            invoiceNumberField: 'InvoiceNo',
            invoiceDateField: 'InvoiceDate',
            customerNameField: 'CustomerName',
            currency: 'KSH',
            itemColumns: [
                { label: 'Description', fieldName: 'Description' },
                { label: 'Quantity', fieldName: 'Quantity' },
                { label: 'Unit Price', fieldName: 'UnitPrice' },
                { label: 'Amount', fieldName: 'LineAmount' },
            ],
            totals: [
                { label: 'Subtotal', fieldName: 'Subtotal' },
                { label: 'Tax', fieldName: 'Tax' },
                { label: 'Total', fieldName: 'GrandTotal' },
            ],
            notes: 'Invoice to be paid in advance. Make payment in 2-3 business days.',
        },
        modules: ['header', 'items', 'totals', 'footer'],
        rdlTemplate: 'corporate',
    },
    {
        id: 'modern-proposal-002',
        name: 'Modern Proposal Invoice',
        description: 'Modern design with detailed service descriptions, ideal for proposals and detailed invoices',
        category: 'modern',
        tags: ['modern', 'proposal', 'detailed', 'services'],
        author: 'Niraj Rajgor (Adapted)',
        version: '1.0.0',
        thumbnail: '/templates/screenshots/modern-proposal-002.png',
        previewUrl: 'https://nirajrajgor.github.io/html-invoice-templates/invoice2/invoice2.html',
        schema: {
            companyName: 'John Doe',
            companyAddress: 'Mumbai, India',
            companyEmail: 'contact@johndoe.com',
            companyPhone: '+91 8097678988',
            website: 'johndoe.com',
            invoiceTitle: 'Invoice',
            customerCompany: 'Hp Solutions',
            customerName: 'Martin Sen',
            customerAddress: 'Delhi, India',
            invoiceNumberField: 'InvoiceNo',
            invoiceDateField: 'InvoiceDate',
            customerNameField: 'CustomerName',
            currency: 'KSH',
            itemColumns: [
                { label: 'Service', fieldName: 'Description' },
                { label: 'Rate', fieldName: 'UnitPrice' },
                { label: 'Hours', fieldName: 'Quantity' },
                { label: 'Total', fieldName: 'LineAmount' },
            ],
            totals: [
                { label: 'Subtotal', fieldName: 'Subtotal' },
                { label: 'Taxes', fieldName: 'Tax' },
                { label: 'Total', fieldName: 'GrandTotal' },
            ],
        },
        modules: ['header', 'items', 'totals', 'footer'],
        rdlTemplate: 'modern',
    },
    {
        id: 'minimal-elegant-003',
        name: 'Minimal Elegant Invoice',
        description: 'Minimalist and elegant design with discount support, perfect for freelancers and agencies',
        category: 'simple',
        tags: ['minimal', 'elegant', 'freelancer', 'discount'],
        author: 'Niraj Rajgor (Adapted)',
        version: '1.0.0',
        thumbnail: '/templates/screenshots/minimal-elegant-003.png',
        previewUrl: 'https://nirajrajgor.github.io/html-invoice-templates/invoice3/invoice3.html',
        schema: {
            companyName: 'ACME Design Co.',
            companyAddress: '189 Fight Street, Las Vegas, LV 878, United States',
            companyEmail: 'contact@acmedesign.co',
            invoiceTitle: 'Invoice',
            customerCompany: 'Airbnb Co.',
            customerName: 'Airbnb Co.',
            customerAddress: '189 Fight Street, Las Vegas, LV 878, United States',
            customerEmail: 'contact@airbnb.co',
            invoiceNumberField: 'InvoiceNo',
            invoiceDateField: 'InvoiceDate',
            customerNameField: 'CustomerName',
            currency: 'KSH',
            itemColumns: [
                { label: 'Service', fieldName: 'Description' },
                { label: 'Amount', fieldName: 'LineAmount' },
            ],
            totals: [
                { label: 'Subtotal', fieldName: 'Subtotal' },
                { label: 'Discount', fieldName: 'Discount' },
                { label: 'Total Due', fieldName: 'GrandTotal' },
            ],
            notes: 'A special note regarding invoice can be written here.',
        },
        modules: ['header', 'items', 'totals', 'footer'],
        rdlTemplate: 'simple',
    },
    {
        id: 'healthcare-medical-004',
        name: 'Healthcare Medical Invoice',
        description: 'Professional design tailored for healthcare and medical services',
        category: 'healthcare',
        tags: ['healthcare', 'medical', 'professional'],
        author: 'Invoice Builder Team',
        version: '1.0.0',
        thumbnail: '/templates/healthcare-preview.png',
        schema: {
            companyName: 'Medical Center',
            companyAddress: '456 Health Ave, Medical District',
            invoiceTitle: 'Medical Invoice',
            invoiceNumberField: 'InvoiceNo',
            invoiceDateField: 'InvoiceDate',
            customerNameField: 'PatientName',
            currency: 'KSH',
            itemColumns: [
                { label: 'Service', fieldName: 'Description' },
                { label: 'Quantity', fieldName: 'Quantity' },
                { label: 'Rate', fieldName: 'UnitPrice' },
                { label: 'Amount', fieldName: 'LineAmount' },
            ],
            totals: [
                { label: 'Subtotal', fieldName: 'Subtotal' },
                { label: 'Insurance', fieldName: 'Insurance' },
                { label: 'Patient Responsibility', fieldName: 'GrandTotal' },
            ],
        },
        modules: ['header', 'items', 'totals', 'footer'],
        rdlTemplate: 'corporate',
    },
    {
        id: 'construction-contractor-005',
        name: 'Construction Contractor Invoice',
        description: 'Robust design for construction and contractor services with detailed line items',
        category: 'construction',
        tags: ['construction', 'contractor', 'detailed'],
        author: 'Invoice Builder Team',
        version: '1.0.0',
        thumbnail: '/templates/construction-preview.png',
        schema: {
            companyName: 'BuildRight Contractors',
            companyAddress: '789 Construction Blvd, Builder City',
            invoiceTitle: 'Contractor Invoice',
            invoiceNumberField: 'InvoiceNo',
            invoiceDateField: 'InvoiceDate',
            customerNameField: 'ClientName',
            currency: 'KSH',
            itemColumns: [
                { label: 'Description', fieldName: 'Description' },
                { label: 'Labor Hours', fieldName: 'Quantity' },
                { label: 'Rate', fieldName: 'UnitPrice' },
                { label: 'Total', fieldName: 'LineAmount' },
            ],
            totals: [
                { label: 'Subtotal', fieldName: 'Subtotal' },
                { label: 'Tax', fieldName: 'Tax' },
                { label: 'Total Due', fieldName: 'GrandTotal' },
            ],
        },
        modules: ['header', 'items', 'totals', 'footer'],
        rdlTemplate: 'simple',
    },
    {
        id: 'retail-colorful-006',
        name: 'Retail Colorful Invoice',
        description: 'Vibrant and modern design perfect for retail businesses',
        category: 'retail',
        tags: ['retail', 'colorful', 'modern'],
        author: 'Invoice Builder Team',
        version: '1.0.0',
        thumbnail: '/templates/retail-preview.png',
        schema: {
            companyName: 'Retail Store',
            companyAddress: '123 Shopping St, Retail District',
            invoiceTitle: 'Invoice',
            invoiceNumberField: 'InvoiceNo',
            invoiceDateField: 'InvoiceDate',
            customerNameField: 'CustomerName',
            currency: 'KSH',
            itemColumns: [
                { label: 'Item', fieldName: 'Description' },
                { label: 'Qty', fieldName: 'Quantity' },
                { label: 'Price', fieldName: 'UnitPrice' },
                { label: 'Total', fieldName: 'LineAmount' },
            ],
            totals: [
                { label: 'Subtotal', fieldName: 'Subtotal' },
                { label: 'Tax', fieldName: 'Tax' },
                { label: 'Total', fieldName: 'GrandTotal' },
            ],
        },
        modules: ['header', 'items', 'totals', 'footer'],
        rdlTemplate: 'modern',
    },
]

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const category = searchParams.get('category')
        const search = searchParams.get('search')

        let templates = FALLBACK_TEMPLATES

        // Try to fetch from GitHub
        try {
            const response = await fetch(TEMPLATES_INDEX_URL, {
                next: { revalidate: 3600 }, // Cache for 1 hour
                headers: {
                    'Accept': 'application/json',
                },
            })

            if (response.ok) {
                const githubTemplates = await response.json()
                if (Array.isArray(githubTemplates) && githubTemplates.length > 0) {
                    templates = githubTemplates
                }
            }
        } catch (error) {
            console.warn('Failed to fetch templates from GitHub, using fallback:', error)
        }

        // Filter by category
        if (category && category !== 'all') {
            templates = templates.filter((t: any) => t.category === category)
        }

        // Filter by search
        if (search) {
            const searchLower = search.toLowerCase()
            templates = templates.filter((t: any) =>
                t.name.toLowerCase().includes(searchLower) ||
                t.description.toLowerCase().includes(searchLower) ||
                t.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
            )
        }

        return NextResponse.json({
            templates,
            source: templates === FALLBACK_TEMPLATES ? 'fallback' : 'github',
        })
    } catch (error) {
        console.error('Error in templates API:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch templates',
                templates: FALLBACK_TEMPLATES,
                source: 'fallback',
            },
            { status: 500 }
        )
    }
}
