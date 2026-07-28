import { NextResponse } from "next/server"
import { z } from "zod"
import { generateHtmlPreview } from "@/lib/preview-generator"
import { generatePdfFromHtml } from "@/lib/pdf"
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

const InvoiceSchemaZod: z.ZodType<Partial<InvoiceSchema>> = z
  .object({
    companyName: z.string().optional(),
    companyAddress: z.string().optional(),
    invoiceTitle: z.string().optional(),
    invoiceNumberField: z.string().optional(),
    invoiceDateField: z.string().optional(),
    customerNameField: z.string().optional(),
    itemColumns: z.array(InvoiceItemColumnSchema).optional(),
    totals: z.array(InvoiceTotalFieldSchema).optional(),
    invoiceItems: z.array(z.any()).optional(),
    logo: z
      .object({
        base64: z.string(),
        position: z.enum(["left", "right"]),
        width: z.number(),
        height: z.number(),
      })
      .optional(),
    invoiceNumber: z.string().optional(),
  })
  .passthrough()

const BodySchema = z.object({
  templateId: z.string(),
  invoiceSchema: InvoiceSchemaZod,
})

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const json = await request.json()
    const parseResult = BodySchema.safeParse(json)

    if (!parseResult.success) {
      return NextResponse.json(
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

    const { templateId, invoiceSchema } = parseResult.data

    // Check if this is a gallery template
    const isGallery = templateId.includes('-')

    let html: string

    if (isGallery) {
      // Use actual gallery template HTML
      const { loadTemplateHtml, injectDataIntoTemplate } = await import('@/lib/template-injector')
      const templateHtml = await loadTemplateHtml(templateId)
      html = injectDataIntoTemplate(templateHtml, invoiceSchema, templateId)
    } else {
      // Use RDL-based preview for basic templates
      html = await generateHtmlPreview(invoiceSchema, templateId)
    }

    const pdfBuffer = await generatePdfFromHtml(html)

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="invoice.pdf"',
      },
    })
  } catch (error) {
    console.error("[v0] API error in /api/generate-pdf:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate PDF",
      },
      { status: 500 },
    )
  }
}


