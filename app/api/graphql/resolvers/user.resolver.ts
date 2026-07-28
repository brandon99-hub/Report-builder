import { GraphQLContext } from '../context'
import { eq } from 'drizzle-orm'
import { users } from '@/lib/db/schema'

export const userResolvers = {
    Query: {
        me: async (_: any, __: any, context: GraphQLContext) => {
            if (!context.user) {
                return null
            }

            const [user] = await context.db
                .select()
                .from(users)
                .where(eq(users.id, context.user.id))
                .limit(1)

            return user || null
        },

        user: async (_: any, { id }: any, context: GraphQLContext) => {
            const [user] = await context.db
                .select({
                    id: users.id,
                    email: users.email,
                    name: users.name,
                    image: users.image,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                })
                .from(users)
                .where(eq(users.id, id))
                .limit(1)

            return user || null
        },
    },

    Mutation: {
        updateProfile: async (_: any, { input }: any, context: GraphQLContext) => {
            if (!context.user) {
                throw new Error('Not authenticated')
            }

            const [updated] = await context.db
                .update(users)
                .set({
                    name: input.name,
                    image: input.image,
                    updatedAt: new Date(),
                })
                .where(eq(users.id, context.user.id))
                .returning({
                    id: users.id,
                    email: users.email,
                    name: users.name,
                    image: users.image,
                    createdAt: users.createdAt,
                    updatedAt: users.updatedAt,
                })

            return updated
        },
    },
}
