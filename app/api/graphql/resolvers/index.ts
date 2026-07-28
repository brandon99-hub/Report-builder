import { templateResolvers } from './template.resolver'
import { invoiceResolvers } from './invoice.resolver'
import { userResolvers } from './user.resolver'
import { GraphQLScalarType, Kind } from 'graphql'

// Custom scalar for DateTime
const dateTimeScalar = new GraphQLScalarType({
    name: 'DateTime',
    description: 'DateTime custom scalar type',
    serialize(value: any) {
        if (value instanceof Date) {
            return value.toISOString()
        }
        return value
    },
    parseValue(value: any) {
        return new Date(value)
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.STRING) {
            return new Date(ast.value)
        }
        return null
    },
})

// Custom scalar for JSON
const jsonScalar = new GraphQLScalarType({
    name: 'JSON',
    description: 'JSON custom scalar type',
    serialize(value: any) {
        return value
    },
    parseValue(value: any) {
        return value
    },
    parseLiteral(ast) {
        if (ast.kind === Kind.OBJECT) {
            return ast
        }
        return null
    },
})

export const resolvers = {
    DateTime: dateTimeScalar,
    JSON: jsonScalar,

    Query: {
        ...templateResolvers.Query,
        ...invoiceResolvers.Query,
        ...userResolvers.Query,
    },

    Mutation: {
        ...templateResolvers.Mutation,
        ...invoiceResolvers.Mutation,
        ...userResolvers.Mutation,
    },

    Template: templateResolvers.Template,
    Invoice: invoiceResolvers.Invoice,
}
