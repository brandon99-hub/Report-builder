import { POST } from "@/app/api/generate/route"

const validBody = {
  templateId: "simple",
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
  },
}

describe("/api/generate", () => {
  it("returns RDL for valid request", async () => {
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify(validBody),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(typeof json.rdl).toBe("string")
    expect(json.rdl).toContain("<Report")
  })

  it("returns 400 with errors for missing fields", async () => {
    const req = new Request("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(Array.isArray(json.errors)).toBe(true)
  })
})


