import { auth } from "@/lib/auth"
import { migrateLocalStorageToDatabase } from "@/lib/migrations/localStorage-to-db"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const result = await migrateLocalStorageToDatabase(session.user.id)

    return NextResponse.json({
      success: true,
      imported: result.imported,
      skipped: result.skipped,
      message: `Imported ${result.imported} template(s) from localStorage`,
    })
  } catch (error) {
    console.error("Migration error:", error)
    return NextResponse.json(
      { error: "Failed to migrate templates" },
      { status: 500 }
    )
  }
}

