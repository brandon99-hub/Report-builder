import { gql } from 'graphql-tag'

export const invoiceTypeDefs = gql`
  type Invoice {
    id: ID!
    invoiceNumber: String!
    template: Template
    schema: JSON!
    rdlContent: String!
    pdfUrl: String
    status: InvoiceStatus!
    createdBy: User
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum InvoiceStatus {
    DRAFT
    GENERATED
    SENT
    PAID
  }

  extend type Query {
    invoices(
      status: InvoiceStatus
      limit: Int
      offset: Int
    ): InvoiceConnection!
    
    invoice(id: ID!): Invoice
    
    myInvoices: [Invoice!]!
  }

  extend type Mutation {
    generateInvoice(input: GenerateInvoiceInput!): Invoice!
    
    updateInvoiceStatus(id: ID!, status: InvoiceStatus!): Invoice!
    
    deleteInvoice(id: ID!): Boolean!
  }

  input GenerateInvoiceInput {
    templateId: ID!
    schema: JSON!
    modules: [String!]
    calculatedFields: [JSON!]
  }

  type InvoiceConnection {
    edges: [InvoiceEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type InvoiceEdge {
    node: Invoice!
    cursor: String!
  }
`
