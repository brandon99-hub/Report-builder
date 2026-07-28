import { GraphQLContext } from '../context'
import { eq, like, and, or, count, desc } from 'drizzle-orm'
import { templates } from '@/lib/db/schema'

export const templateResolvers = {
    Query: {
        templates: async (
            _: any,
            { category, search, limit = 10, offset = 0 }: any,
            context: GraphQLContext
        ) => {
            const conditions = []

            // Only show public templates or user's own templates
            if (context.user) {
                conditions.push(
                    or(
                        eq(templates.isPublic, true),
                        eq(templates.userId, context.user.id)
                    )
                )
            } else {
                conditions.push(eq(templates.isPublic, true))
            }

            if (category) {
                conditions.push(eq(templates.category, category))
            }

            if (search) {
                conditions.push(like(templates.name, `%${search}%`))
            }

            const results = await context.db
                .select()
                .from(templates)
                .where(and(...conditions))
                .orderBy(desc(templates.createdAt))
                .limit(limit)
                .offset(offset)

            const [totalCountResult] = await context.db
                .select({ count: count() })
                .from(templates)
                .where(and(...conditions))

            const totalCount = totalCountResult?.count || 0

            return {
                edges: results.map((template, index) => ({
                    node: template,
                    cursor: Buffer.from(`${offset + index}`).toString('base64'),
                })),
                pageInfo: {
                    hasNextPage: offset + limit < totalCount,
                    hasPreviousPage: offset > 0,
                    startCursor: results.length > 0 ? Buffer.from(`${offset}`).toString('base64') : null,
                    endCursor: results.length > 0 ? Buffer.from(`${offset + results.length - 1}`).toString('base64') : null,
                },
                totalCount,
            }
        },

        template: async (_: any, { id }: any, context: GraphQLContext) => {
            const [result] = await context.db
                .select()
                .from(templates)
                .where(eq(templates.id, id))
                .limit(1)

            if (!result) return null

            // Check if user has access to this template
            if (!result.isPublic && (!context.user || result.userId !== context.user.id)) {
                throw new Error('Not authorized to view this template')
            }

            return result
        },

        myTemplates: async (_: any, __: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            return await context.db
                .select()
                .from(templates)
                .where(eq(templates.userId, context.user.id))
                .orderBy(desc(templates.createdAt))
        },
    },

    Mutation: {
        createTemplate: async (_: any, { input }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            const [newTemplate] = await context.db
                .insert(templates)
                .values({
                    ...input,
                    userId: context.user.id,
                    templateId: input.category.toLowerCase(), // Use category as templateId
                })
                .returning()

            return newTemplate
        },

        updateTemplate: async (_: any, { id, input }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            // Check ownership
            const [existing] = await context.db
                .select()
                .from(templates)
                .where(eq(templates.id, id))
                .limit(1)

            if (!existing || existing.userId !== context.user.id) {
                throw new Error('Not authorized to update this template')
            }

            const [updated] = await context.db
                .update(templates)
                .set({
                    ...input,
                    updatedAt: new Date(),
                })
                .where(eq(templates.id, id))
                .returning()

            return updated
        },

        deleteTemplate: async (_: any, { id }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            // Check ownership
            const [existing] = await context.db
                .select()
                .from(templates)
                .where(eq(templates.id, id))
                .limit(1)

            if (!existing || existing.userId !== context.user.id) {
                throw new Error('Not authorized to delete this template')
            }

            await context.db
                .delete(templates)
                .where(eq(templates.id, id))

            return true
        },

        cloneTemplate: async (_: any, { id }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            const [original] = await context.db
                .select()
                .from(templates)
                .where(eq(templates.id, id))
                .limit(1)

            if (!original) {
                throw new Error('Template not found')
            }

            // Check if user has access to this template
            if (!original.isPublic && original.userId !== context.user.id) {
                throw new Error('Not authorized to clone this template')
            }

            const [cloned] = await context.db
                .insert(templates)
                .values({
                    name: `${original.name} (Copy)`,
                    description: original.description,
                    category: original.category,
                    thumbnail: original.thumbnail,
                    schema: original.schema,
                    templateId: original.templateId,
                    modules: original.modules,
                    calculatedFields: original.calculatedFields,
                    rdlXml: original.rdlXml,
                    isPublic: false, // Clones are private by default
                    userId: context.user.id,
                })
                .returning()

            return cloned
        },
    },

    Template: {
        createdBy: async (parent: any, _: any, context: GraphQLContext) => {
            const { users } = await import('@/lib/db/schema')
            const [user] = await context.db
                .select()
                .from(users)
                .where(eq(users.id, parent.userId))
                .limit(1)

            return user || null
        },
    },
}
