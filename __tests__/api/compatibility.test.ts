import { POST } from "@/app/api/compatibility/route"

const minimalRdl = `<?xml version="1.0" encoding="utf-8"?>
<Report xmlns="http://schemas.microsoft.com/sqlserver/reporting/2016/01/reportdefinition">
  <DataSources>
    <DataSource Name="DataSource1" />
  </DataSources>
</Report>`

describe("/api/compatibility", () => {
  it("returns issues and report for valid RDL", async () => {
    const req = new Request("http://localhost/api/compatibility", {
      method: "POST",
      body: JSON.stringify({ rdlXml: minimalRdl }),
    })

    const res = await POST(req)
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.success).toBe(true)
    expect(Array.isArray(json.issues)).toBe(true)
    expect(typeof json.report).toBe("string")
  })

  it("returns 400 for missing rdlXml", async () => {
    const req = new Request("http://localhost/api/compatibility", {
      method: "POST",
      body: JSON.stringify({}),
    })

    const res = await POST(req)
    expect(res.status).toBe(400)
    const json = await res.json()
    expect(json.success).toBe(false)
    expect(json.error).toBeDefined()
  })
})


