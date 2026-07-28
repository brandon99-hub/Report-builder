/**
 * Column Visibility Utilities
 * Filters invoice columns based on visibility settings
 */

import { AVAILABLE_INVOICE_COLUMNS, type ItemColumn } from './types/invoice'

// Essential columns that are always visible
const ESSENTIAL_COLUMNS = ['description', 'quantity', 'unitPrice', 'lineTotal']

/**
 * Filter item columns based on visibility settings
 * @param itemColumns - All available columns
 * @param visibleColumns - Array of column fieldNames that should be visible
 * @returns Filtered array of columns to display
 */
export function filterVisibleColumns(
    itemColumns: ItemColumn[],
    visibleColumns?: string[]
): ItemColumn[] {
    if (!visibleColumns || visibleColumns.length === 0) {
        // No visibility settings - return all columns
        return itemColumns
    }

    // Filter columns: include essential columns + selected optional columns
    return itemColumns.filter(col =>
        ESSENTIAL_COLUMNS.includes(col.fieldName) ||
        visibleColumns.includes(col.fieldName)
    )
}

/**
 * Get visible columns from schema
 * Handles both old format (itemColumns) and new format (itemColumns + visibleColumns)
 */
export function getVisibleColumns(schema: any): ItemColumn[] {
    const allColumns = schema.itemColumns || AVAILABLE_INVOICE_COLUMNS
    const visibleColumnIds = schema.visibleColumns

    return filterVisibleColumns(allColumns, visibleColumnIds)
}
