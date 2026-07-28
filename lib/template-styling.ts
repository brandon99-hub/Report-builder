/**
 * Template Styling Utilities for RDL Generation
 * Applies template-specific styling (colors, fonts, borders) to RDL XML
 */

import { DEFAULT_TEMPLATE_STYLES, type TemplateStyle } from './types/invoice'

/**
 * Apply template styling to RDL XML
 * Replaces color codes, font names, and border styles based on template
 */
export function applyTemplateStyle(rdl: string, templateId: string): string {
    const style = DEFAULT_TEMPLATE_STYLES[templateId]
    if (!style) {
        return rdl // No styling for this template
    }

    let styledRdl = rdl

    // Apply color replacements
    styledRdl = applyColorStyle(styledRdl, style)

    // Apply font replacements
    styledRdl = applyFontStyle(styledRdl, style)

    // Apply border styling
    styledRdl = applyBorderStyle(styledRdl, style)

    return styledRdl
}

/**
 * Apply color styling based on template
 */
function applyColorStyle(rdl: string, style: TemplateStyle): string {
    let result = rdl

    // Replace header background color
    result = result.replace(
        /<BackgroundColor>#1e3a5f<\/BackgroundColor>/g,
        `<BackgroundColor>${style.colors.primary}</BackgroundColor>`
    )

    // Replace primary text colors
    result = result.replace(
        /<Color>#1f2937<\/Color>/g,
        `<Color>${style.colors.text}</Color>`
    )

    // Replace secondary/muted colors
    result = result.replace(
        /<Color>#6b7280<\/Color>/g,
        `<Color>${style.colors.secondary}</Color>`
    )

    // Replace accent colors (if present)
    if (style.colors.accent) {
        result = result.replace(
            /<Color>#f59e0b<\/Color>/g,
            `<Color>${style.colors.accent}</Color>`
        )
    }

    // Replace border colors
    result = result.replace(
        /<Color>#e5e7eb<\/Color>/g,
        `<Color>${style.borders?.color || '#e5e7eb'}</Color>`
    )

    return result
}

/**
 * Apply font styling based on template
 */
function applyFontStyle(rdl: string, style: TemplateStyle): string {
    let result = rdl

    // Replace font families
    // Heading fonts
    result = result.replace(
        /<FontFamily>Arial<\/FontFamily>/g,
        `<FontFamily>${style.fonts.heading}</FontFamily>`
    )

    // Body fonts (if different from heading)
    if (style.fonts.body !== style.fonts.heading) {
        // Replace specific body text fonts
        result = result.replace(
            /<FontFamily>Segoe UI<\/FontFamily>/g,
            `<FontFamily>${style.fonts.body}</FontFamily>`
        )
    }

    // Apply font sizes if specified
    if (style.fonts.sizes) {
        if (style.fonts.sizes.h1) {
            result = result.replace(
                /<FontSize>24pt<\/FontSize>/g,
                `<FontSize>${style.fonts.sizes.h1}</FontSize>`
            )
        }
        if (style.fonts.sizes.h2) {
            result = result.replace(
                /<FontSize>18pt<\/FontSize>/g,
                `<FontSize>${style.fonts.sizes.h2}</FontSize>`
            )
        }
        if (style.fonts.sizes.body) {
            result = result.replace(
                /<FontSize>10pt<\/FontSize>/g,
                `<FontSize>${style.fonts.sizes.body}</FontSize>`
            )
        }
    }

    return result
}

/**
 * Apply border styling based on template
 */
function applyBorderStyle(rdl: string, style: TemplateStyle): string {
    if (!style.borders) {
        return rdl
    }

    let result = rdl

    // Replace border widths
    result = result.replace(
        /<Width>1pt<\/Width>/g,
        `<Width>${style.borders.width}</Width>`
    )

    // Replace border styles
    const borderStyleMap: Record<string, string> = {
        solid: 'Solid',
        dashed: 'Dashed',
        dotted: 'Dotted',
    }

    const rdlBorderStyle = borderStyleMap[style.borders.style] || 'Solid'
    result = result.replace(
        /<Style>Solid<\/Style>/g,
        `<Style>${rdlBorderStyle}</Style>`
    )

    return result
}

/**
 * Get template style for a given template ID
 */
export function getTemplateStyle(templateId: string): TemplateStyle | null {
    return DEFAULT_TEMPLATE_STYLES[templateId] || null
}

/**
 * Check if template has custom styling
 */
export function hasTemplateStyle(templateId: string): boolean {
    return templateId in DEFAULT_TEMPLATE_STYLES
}
