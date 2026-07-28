import { gql } from 'graphql-tag'

export const templateTypeDefs = gql`
  type Template {
    id: ID!
    name: String!
    description: String
    category: TemplateCategory!
    thumbnail: String
    rdlContent: String!
    schema: JSON!
    modules: [String!]
    isPublic: Boolean!
    createdBy: User
    createdAt: DateTime!
    updatedAt: DateTime!
    usageCount: Int!
    rating: Float
  }

  enum TemplateCategory {
    SIMPLE
    MODERN
    CORPORATE
    RETAIL
    HEALTHCARE
    CONSTRUCTION
    PROFESSIONAL
  }

  extend type Query {
    templates(
      category: TemplateCategory
      search: String
      limit: Int
      offset: Int
    ): TemplateConnection!
    
    template(id: ID!): Template
    
    myTemplates: [Template!]!
  }

  extend type Mutation {
    createTemplate(input: CreateTemplateInput!): Template!
    
    updateTemplate(id: ID!, input: UpdateTemplateInput!): Template!
    
    deleteTemplate(id: ID!): Boolean!
    
    cloneTemplate(id: ID!): Template!
  }

  input CreateTemplateInput {
    name: String!
    description: String
    category: TemplateCategory!
    rdlContent: String!
    schema: JSON!
    modules: [String!]
    isPublic: Boolean
  }

  input UpdateTemplateInput {
    name: String
    description: String
    category: TemplateCategory
    rdlContent: String
    schema: JSON
    modules: [String!]
    isPublic: Boolean
  }

  type TemplateConnection {
    edges: [TemplateEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type TemplateEdge {
    node: Template!
    cursor: String!
  }

  type PageInfo {
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
    endCursor: String
  }
`
