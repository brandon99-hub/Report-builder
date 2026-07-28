import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { createContext } from './context'
import { NextRequest } from 'next/server'

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
})

const server = new ApolloServer({
    schema,
    introspection: process.env.NODE_ENV !== 'production',
    formatError: (error) => {
        console.error('GraphQL Error:', error)
        return {
            message: error.message,
            locations: error.locations,
            path: error.path,
            extensions: {
                code: error.extensions?.code,
            },
        }
    },
})

const handler = startServerAndCreateNextHandler(server, {
    context: async (req: NextRequest) => createContext(),
})

export async function GET(request: NextRequest) {
    return handler(request)
}

export async function POST(request: NextRequest) {
    return handler(request)
}
