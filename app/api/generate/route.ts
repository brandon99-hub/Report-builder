import { generateRDL } from "@/lib/rdl-generator"
import { z } from "zod"
import type { InvoiceSchema } from "@/lib/validation"

const InvoiceItemColumnSchema = z.object({
  fieldName: z.string(),
  label: z.string(),
  dataType: z.enum(["string", "number", "currency", "percentage"]).optional(),
  format: z.string().optional(),
})

const InvoiceTotalFieldSchema = z.object({
  fieldName: z.string(),
  label: z.string(),
  dataType: z.enum(["currency", "number"]).optional(),
})

const InvoiceSchemaZod: z.ZodType<Partial<InvoiceSchema>> = z.object({
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  invoiceTitle: z.string().optional(),
  invoiceNumberField: z.string().optional(),
  invoiceDateField: z.string().optional(),
  customerNameField: z.string().optional(),
  itemColumns: z.array(InvoiceItemColumnSchema).optional(),
  totals: z.array(InvoiceTotalFieldSchema).optional(),
}).passthrough()

const BodySchema = z.object({
  templateId: z.string(),
  invoiceSchema: InvoiceSchemaZod,
  modules: z.any().optional(),
  calculatedFields: z.any().optional(),
})

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parseResult = BodySchema.safeParse(json)

    if (!parseResult.success) {
      return Response.json(
        {
          success: false,
          errors: parseResult.error.issues.map((issue) => ({
            field: issue.path.join(".") || "body",
            message: issue.message,
          })),
        },
        { status: 400 },
      )
    }

    const { templateId, invoiceSchema, modules, calculatedFields } = parseResult.data

    const result = generateRDL(templateId, invoiceSchema, modules, calculatedFields)

    if (!result.success) {
      return Response.json(result, { status: 400 })
    }

    return Response.json(
      {
        success: true,
        rdl: result.rdl,
        warnings: result.warnings ?? [],
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] API error in /api/generate:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate RDL",
      },
      { status: 500 },
    )
  }
}
