/**
 * Gallery Template Style Definitions
 * Maps gallery template IDs to their specific styling (colors, fonts, layout)
 */

export interface GalleryTemplateStyle {
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
    }
    layout: 'corporate' | 'modern' | 'simple'
}

export const GALLERY_TEMPLATE_STYLES: Record<string, GalleryTemplateStyle> = {
    'professional-blue-001': {
        colors: {
            primary: '#1e3a5f',
            secondary: '#4a5568',
            text: '#1f2937',
            background: '#ffffff',
        },
        fonts: {
            heading: 'Arial, sans-serif',
            body: 'Arial, sans-serif',
        },
        layout: 'corporate',
    },
    'modern-proposal-002': {
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
        },
        layout: 'modern',
    },
    'minimal-elegant-003': {
        colors: {
            primary: '#2563eb',
            secondary: '#64748b',
            text: '#0f172a',
            background: '#ffffff',
        },
        fonts: {
            heading: 'Georgia, serif',
            body: 'Arial, sans-serif',
        },
        layout: 'simple',
    },
    'healthcare-medical-004': {
        colors: {
            primary: '#059669',
            secondary: '#10b981',
            text: '#064e3b',
            background: '#ffffff',
            accent: '#34d399',
        },
        fonts: {
            heading: 'Arial, sans-serif',
            body: 'Arial, sans-serif',
        },
        layout: 'corporate',
    },
    'construction-contractor-005': {
        colors: {
            primary: '#ea580c',
            secondary: '#f97316',
            text: '#431407',
            background: '#ffffff',
            accent: '#fb923c',
        },
        fonts: {
            heading: 'Arial Black, sans-serif',
            body: 'Arial, sans-serif',
        },
        layout: 'modern',
    },
    'retail-colorful-006': {
        colors: {
            primary: '#dc2626',
            secondary: '#ef4444',
            text: '#7f1d1d',
            background: '#ffffff',
            accent: '#fbbf24',
        },
        fonts: {
            heading: 'Verdana, sans-serif',
            body: 'Verdana, sans-serif',
        },
        layout: 'modern',
    },
}

/**
 * Get gallery template style by ID
 */
export function getGalleryTemplateStyle(templateId: string): GalleryTemplateStyle | null {
    return GALLERY_TEMPLATE_STYLES[templateId] || null
}

/**
 * Check if a template ID is a gallery template
 */
export function isGalleryTemplate(templateId: string): boolean {
    return templateId.includes('-') && templateId in GALLERY_TEMPLATE_STYLES
}
