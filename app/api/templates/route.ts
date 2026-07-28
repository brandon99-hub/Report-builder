import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { templates } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userTemplates = await db
      .select({
        id: templates.id,
        name: templates.name,
        description: templates.description,
        templateId: templates.templateId,
        isFavorite: templates.isFavorite,
        createdAt: templates.createdAt,
        updatedAt: templates.updatedAt,
      })
      .from(templates)
      .where(eq(templates.userId, session.user.id))
      .orderBy(desc(templates.updatedAt))

    return NextResponse.json(userTemplates)
  } catch (error) {
    console.error("Error fetching templates:", error)
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, description, schema, templateId, modules, calculatedFields, rdlXml } = body

    if (!name || !schema || !templateId) {
      return NextResponse.json(
        { error: "Name, schema, and templateId are required" },
        { status: 400 }
      )
    }

    const [newTemplate] = await db
      .insert(templates)
      .values({
        userId: session.user.id,
        name,
        description: description || null,
        schema: schema as any,
        templateId,
        modules: modules || null,
        calculatedFields: calculatedFields || null,
        rdlXml: rdlXml || null,
      })
      .returning()

    return NextResponse.json(newTemplate, { status: 201 })
  } catch (error) {
    console.error("Error creating template:", error)
    return NextResponse.json(
      { error: "Failed to create template" },
      { status: 500 }
    )
  }
}
