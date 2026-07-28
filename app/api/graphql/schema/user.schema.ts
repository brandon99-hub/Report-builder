import { gql } from 'graphql-tag'

export const userTypeDefs = gql`
  type User {
    id: ID!
    email: String!
    name: String
    image: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  extend type Query {
    me: User
    
    user(id: ID!): User
  }

  extend type Mutation {
    updateProfile(input: UpdateProfileInput!): User!
  }

  input UpdateProfileInput {
    name: String
    image: String
  }
`
