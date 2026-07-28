// Atomic RDL Modules system
export interface RDLModule {
  id: string
  name: string
  description: string
  enabled: boolean
  order: number
}

export const DEFAULT_MODULES: RDLModule[] = [
  {
    id: "header",
    name: "Header & Logo",
    description: "Company logo and branding section",
    enabled: true,
    order: 1,
  },
  {
    id: "company-info",
    name: "Company Information",
    description: "Company name, address, contact details",
    enabled: true,
    order: 2,
  },
  {
    id: "customer-info",
    name: "Customer Information",
    description: "Bill to / Ship to customer details",
    enabled: true,
    order: 3,
  },
  {
    id: "invoice-details",
    name: "Invoice Details",
    description: "Invoice number, date, reference info",
    enabled: true,
    order: 4,
  },
  {
    id: "item-table",
    name: "Item Table",
    description: "Line items with quantity, unit price, amounts",
    enabled: true,
    order: 5,
  },
  {
    id: "tax-breakdown",
    name: "Tax Breakdown",
    description: "Itemized tax calculations",
    enabled: false,
    order: 6,
  },
  {
    id: "totals",
    name: "Totals Section",
    description: "Subtotal, tax, discount, grand total",
    enabled: true,
    order: 7,
  },
  {
    id: "footer-notes",
    name: "Footer Notes",
    description: "Terms, conditions, payment instructions",
    enabled: true,
    order: 8,
  },
]

export function getEnabledModules(modules: RDLModule[]): RDLModule[] {
  return modules.filter((m) => m.enabled).sort((a, b) => a.order - b.order)
}

export function updateModuleState(modules: RDLModule[], moduleId: string, enabled: boolean): RDLModule[] {
  return modules.map((m) => (m.id === moduleId ? { ...m, enabled } : m))
}
