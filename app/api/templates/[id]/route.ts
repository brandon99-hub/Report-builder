import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { templates } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const template = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, session.user.id)))
      .limit(1)

    if (template.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(template[0])
  } catch (error) {
    console.error("Error fetching template:", error)
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Check ownership
    const existing = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, session.user.id)))
      .limit(1)

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    const [updated] = await db
      .update(templates)
      .set({
        ...body,
        updatedAt: new Date(),
      })
      .where(eq(templates.id, id))
      .returning()

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating template:", error)
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check ownership
    const existing = await db
      .select()
      .from(templates)
      .where(and(eq(templates.id, id), eq(templates.userId, session.user.id)))
      .limit(1)

    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Template not found" },
        { status: 404 }
      )
    }

    await db
      .delete(templates)
      .where(eq(templates.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting template:", error)
    return NextResponse.json(
      { error: "Failed to delete template" },
      { status: 500 }
    )
  }
}

