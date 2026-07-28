import { checkBCCompatibility, generateCompatibilityReport } from "@/lib/bc-compatibility-checker"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rdlXml } = body

    if (!rdlXml) {
      return Response.json({ success: false, error: "RDL XML is required" }, { status: 400 })
    }

    const issues = checkBCCompatibility(rdlXml)
    const report = generateCompatibilityReport(issues)

    return Response.json({
      success: true,
      issues,
      report,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Compatibility check failed",
      },
      { status: 500 },
    )
  }
}
