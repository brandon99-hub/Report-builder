import { db } from "@/lib/db"
import { templates } from "@/lib/db/schema"
import type { TemplateVersion } from "@/lib/version-history"

const STORAGE_KEY = "invoice_version_history"

export async function migrateLocalStorageToDatabase(userId: string): Promise<{ imported: number; skipped: number }> {
  let imported = 0
  let skipped = 0

  try {
    // Get all localStorage keys that match version history pattern
    const allKeys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(`${STORAGE_KEY}_`)) {
        allKeys.push(key)
      }
    }

    for (const key of allKeys) {
      try {
        const stored = localStorage.getItem(key)
        if (!stored) continue

        const history = JSON.parse(stored) as {
          projectId: string
          versions: TemplateVersion[]
        }

        // Import each version as a template
        for (const version of history.versions) {
          try {
            // Check if template with same name already exists
            const existing = await db
              .select()
              .from(templates)
              .where(eq(templates.userId, userId))
              .limit(100) // Check recent templates to avoid duplicates

            const templateName = version.name || `Template ${new Date(version.timestamp).toLocaleDateString()}`
            const isDuplicate = existing.some(t => t.name === templateName)

            // Skip if duplicate found
            if (isDuplicate) {
              skipped++
              continue
            }

            // Create template from version
            await db.insert(templates).values({
              userId,
              name: templateName,
              description: version.description || undefined,
              schema: version.schema as any,
              templateId: version.templateId || "modern",
              modules: version.modules || null,
              calculatedFields: null,
              rdlXml: version.rdlXml || null,
              isFavorite: false,
              tags: version.tags || null,
            })

            imported++
          } catch (error) {
            console.error(`Error importing version ${version.id}:`, error)
            skipped++
          }
        }
      } catch (error) {
        console.error(`Error parsing localStorage key ${key}:`, error)
        skipped++
      }
    }

    return { imported, skipped }
  } catch (error) {
    console.error("Migration error:", error)
    throw error
  }
}

