import { POST } from "@/app/api/generate-pdf/route"

jest.mock("@/lib/pdf", () => ({
  generatePdfFromHtml: jest.fn(async () => Buffer.from("PDF")),
}))

const validBody = {
  templateId: "modern",
  invoiceSchema: {
    companyName: "Test Company",
    companyAddress: "123 Test St",
    invoiceTitle: "Invoice",
    invoiceNumberField: "InvoiceNo",
    invoiceDateField: "InvoiceDate",
    customerNameField: "CustomerName",
    itemColumns: [
      { label: "Description", fieldName: "Description" },
      { label: "Quantity", fieldName: "Quantity" },
    ],
    totals: [
      { label: "Subtotal", fieldName: "Subtotal" },
      { label: "Total", fieldName: "GrandTotal" },
    ],
    invoiceItems: [],
  },
}

describe("/api/generate-pdf", () => {
  it("returns PDF for valid request", async () => {
    const req = new Request("http://localhost/api/generate-pdf", {
      method: "POST",
      body: JSON.stringify(validBody),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const arrayBuffer = await res.arrayBuffer()
    expect(arrayBuffer.byteLength).toBeGreaterThan(0)
    expect(res.headers.get("content-type")).toBe("application/pdf")
  })

  it("returns 400 for invalid body", async () => {
    const req = new Request("http://localhost/api/generate-pdf", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
  })
})


