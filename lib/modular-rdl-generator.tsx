import { type RDLModule, getEnabledModules, DEFAULT_MODULES } from "./modules"
import type { InvoiceSchema } from "./validation"
import { getTemplate } from "./templates"
import { buildItemTableXml, buildItemTableWithData, buildTotalsXml } from "./rdl-builders"
import { sanitizeFieldName } from "./validation"
import { generateInvoiceNumber } from "./rdl-generator"

export interface ModularRDLConfig {
  schema: InvoiceSchema
  templateId: string
  modules: RDLModule[]
}

export function generateModularRDL(config: ModularRDLConfig): string {
  const template = getTemplate(config.templateId)
  const enabledModules = getEnabledModules(config.modules)
  const enabledModuleIds = new Set(enabledModules.map(m => m.id))

  // Start with base template and apply standard replacements
  let rdl = template
  
  // Standard replacements that apply regardless of modules
  const companyAddressFormatted = (config.schema.companyAddress || "").replace(/\n/g, "&#x0A;")
  const customerAddressFormatted = (config.schema.customerAddress || "").replace(/\n/g, "&#x0A;")
  
  rdl = rdl
    .replace(/{COMPANY_NAME}/g, escapeXml(config.schema.companyName || ""))
    .replace(/{COMPANY_ADDRESS}/g, escapeXml(companyAddressFormatted))
    .replace(/{INVOICE_TITLE}/g, escapeXml(config.schema.invoiceTitle || "Invoice"))
    .replace(/{CUSTOMER_NAME}/g, escapeXml(config.schema.customerName || ""))
    .replace(/{CUSTOMER_ADDRESS}/g, escapeXml(customerAddressFormatted))
    .replace(/{INVOICE_NO_FIELD}/g, sanitizeFieldName(config.schema.invoiceNumberField))
    .replace(/{INVOICE_DATE_FIELD}/g, sanitizeFieldName(config.schema.invoiceDateField))
    .replace(/{CUSTOMER_NAME_FIELD}/g, sanitizeFieldName(config.schema.customerNameField))

  // Apply module-specific logic
  // Header module - always include if enabled, but can be toggled
  if (!enabledModuleIds.has("header")) {
    // Remove header section (simplified - in real implementation would need more sophisticated parsing)
    rdl = rdl.replace(/<Rectangle Name="HeaderBackground">[\s\S]*?<\/Rectangle>/g, "")
  }

  // Company info module
  if (!enabledModuleIds.has("company-info")) {
    rdl = rdl.replace(/<Rectangle Name="BillFromBox">[\s\S]*?<\/Rectangle>/g, "")
  }

  // Customer info module
  if (!enabledModuleIds.has("customer-info")) {
    rdl = rdl.replace(/<Rectangle Name="BillToBox">[\s\S]*?<\/Rectangle>/g, "")
  }

  // Item table module
  if (enabledModuleIds.has("item-table")) {
    const itemTableXml = (config.schema.invoiceItems && config.schema.invoiceItems.length > 0)
      ? buildItemTableWithData(config.schema.itemColumns, config.schema.invoiceItems)
      : buildItemTableXml(config.schema.itemColumns)
    rdl = rdl.replace(/{ITEM_TABLE_XML}/g, itemTableXml)
  } else {
    rdl = rdl.replace(/{ITEM_TABLE_XML}/g, "")
  }

  // Tax breakdown module
  if (!enabledModuleIds.has("tax-breakdown")) {
    // Remove tax breakdown section if exists
    rdl = rdl.replace(/<Textbox Name="TaxBreakdown">[\s\S]*?<\/Textbox>/g, "")
  }

  // Totals module
  if (enabledModuleIds.has("totals")) {
    // Modular path is preview-only today, so bcMode is always false here
    const totalsXml = buildTotalsXml(config.schema.totals || [], config.schema.invoiceItems, false)
    rdl = rdl.replace(/{TOTALS_SECTION}/g, totalsXml)
  } else {
    rdl = rdl.replace(/{TOTALS_SECTION}/g, "")
  }

  // Footer notes module
  if (!enabledModuleIds.has("footer-notes")) {
    rdl = rdl.replace(/<Textbox Name="FooterNotes">[\s\S]*?<\/Textbox>/g, "")
  }

  // Replace ALL field references with static values from form
  const invoiceNumber = config.schema.invoiceNumber || 
    ((config.schema.invoiceItems && config.schema.invoiceItems.length > 0) ? generateInvoiceNumber() : null)
  const invoiceDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
  
  // Replace invoice number field references with actual value
  if (invoiceNumber) {
    const invoiceNoFieldPattern = `=Fields!${sanitizeFieldName(config.schema.invoiceNumberField)}.Value`
    rdl = rdl.replace(new RegExp(escapeRegex(invoiceNoFieldPattern), "g"), escapeXml(invoiceNumber))
    rdl = rdl.replace(/{INVOICE_NUMBER}/g, escapeXml(invoiceNumber))
  }
  
  // Replace invoice date field references with actual date value
  const invoiceDateFieldPattern = `=Fields!${sanitizeFieldName(config.schema.invoiceDateField)}.Value`
  rdl = rdl.replace(new RegExp(escapeRegex(invoiceDateFieldPattern), "g"), escapeXml(invoiceDate))
  rdl = rdl.replace(/{INVOICE_DATE}/g, escapeXml(invoiceDate))
  
  // Replace customer name field references with static value
  const customerNameFieldPattern = `=Fields!${sanitizeFieldName(config.schema.customerNameField)}.Value`
  rdl = rdl.replace(new RegExp(escapeRegex(customerNameFieldPattern), "g"), escapeXml(config.schema.customerName || ""))
  
  // Remove all other field references when we have static data
  if (config.schema.invoiceItems && config.schema.invoiceItems.length > 0) {
    rdl = rdl.replace(/=Fields![^}]+\.Value/g, "")
  }

  return rdl
}


function escapeXml(value: string): string {
  if (!value) return ""
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
