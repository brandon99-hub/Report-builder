import { GraphQLContext } from '../context'
import { eq, and, count, desc } from 'drizzle-orm'
import { invoices, templates } from '@/lib/db/schema'

export const invoiceResolvers = {
    Query: {
        invoices: async (
            _: any,
            { status, limit = 10, offset = 0 }: any,
            context: GraphQLContext
        ) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            const conditions = [eq(invoices.userId, context.user.id)]

            if (status) {
                conditions.push(eq(invoices.status, status))
            }

            const results = await context.db
                .select()
                .from(invoices)
                .where(and(...conditions))
                .orderBy(desc(invoices.createdAt))
                .limit(limit)
                .offset(offset)

            const [totalCountResult] = await context.db
                .select({ count: count() })
                .from(invoices)
                .where(and(...conditions))

            const totalCount = totalCountResult?.count || 0

            return {
                edges: results.map((invoice, index) => ({
                    node: invoice,
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

        invoice: async (_: any, { id }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            const [result] = await context.db
                .select()
                .from(invoices)
                .where(and(
                    eq(invoices.id, id),
                    eq(invoices.userId, context.user.id)
                ))
                .limit(1)

            return result || null
        },

        myInvoices: async (_: any, __: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            return await context.db
                .select()
                .from(invoices)
                .where(eq(invoices.userId, context.user.id))
                .orderBy(desc(invoices.createdAt))
        },
    },

    Mutation: {
        generateInvoice: async (_: any, { input }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            // Generate RDL using existing API
            const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    templateId: input.templateId,
                    invoiceSchema: input.schema,
                    modules: input.modules,
                    calculatedFields: input.calculatedFields,
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to generate invoice RDL')
            }

            const { rdl } = await response.json()

            // Generate invoice number
            const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`

            const [newInvoice] = await context.db
                .insert(invoices)
                .values({
                    userId: context.user.id,
                    templateId: input.templateId,
                    invoiceNumber,
                    schema: input.schema,
                    rdlXml: rdl,
                    status: 'GENERATED',
                })
                .returning()

            return newInvoice
        },

        updateInvoiceStatus: async (_: any, { id, status }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            // Check ownership
            const [existing] = await context.db
                .select()
                .from(invoices)
                .where(and(
                    eq(invoices.id, id),
                    eq(invoices.userId, context.user.id)
                ))
                .limit(1)

            if (!existing) {
                throw new Error('Invoice not found or not authorized')
            }

            const [updated] = await context.db
                .update(invoices)
                .set({
                    status,
                    updatedAt: new Date(),
                })
                .where(eq(invoices.id, id))
                .returning()

            return updated
        },

        deleteInvoice: async (_: any, { id }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            // Check ownership
            const [existing] = await context.db
                .select()
                .from(invoices)
                .where(and(
                    eq(invoices.id, id),
                    eq(invoices.userId, context.user.id)
                ))
                .limit(1)

            if (!existing) {
                throw new Error('Invoice not found or not authorized')
            }

            await context.db
                .delete(invoices)
                .where(eq(invoices.id, id))

            return true
        },
    },

    Invoice: {
        template: async (parent: any, _: any, context: GraphQLContext) => {
            if (!parent.templateId) return null

            const [template] = await context.db
                .select()
                .from(templates)
                .where(eq(templates.id, parent.templateId))
                .limit(1)

            return template || null
        },

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
