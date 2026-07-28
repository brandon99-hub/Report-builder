import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export interface GraphQLContext {
    user: {
        id: string
        email: string
        name?: string | null
    } | null
    db: typeof db
}

export async function createContext(): Promise<GraphQLContext> {
    const session = await auth()

    return {
        user: session?.user ? {
            id: session.user.id as string,
            email: session.user.email as string,
            name: session.user.name,
        } : null,
        db,
    }
}
