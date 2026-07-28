import { gql } from 'graphql-tag'
import { templateTypeDefs } from './template.schema'
import { invoiceTypeDefs } from './invoice.schema'
import { userTypeDefs } from './user.schema'

// Base schema with scalar types
const baseTypeDefs = gql`
  scalar DateTime
  scalar JSON

  type Query {
    _empty: String
  }

  type Mutation {
    _empty: String
  }

  type Subscription {
    _empty: String
  }
`

export const typeDefs = [
    baseTypeDefs,
    templateTypeDefs,
    invoiceTypeDefs,
    userTypeDefs,
]
