import { gql } from '@apollo/client'

export const GET_INVOICES = gql`
  query GetInvoices($status: InvoiceStatus, $limit: Int, $offset: Int) {
    invoices(status: $status, limit: $limit, offset: $offset) {
      edges {
        node {
          id
          invoiceNumber
          status
          createdAt
          updatedAt
          template {
            id
            name
            category
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`

export const GET_INVOICE = gql`
  query GetInvoice($id: ID!) {
    invoice(id: $id) {
      id
      invoiceNumber
      schema
      rdlContent
      pdfUrl
      status
      createdAt
      updatedAt
      template {
        id
        name
        category
      }
      createdBy {
        id
        name
        email
      }
    }
  }
`

export const GET_MY_INVOICES = gql`
  query GetMyInvoices {
    myInvoices {
      id
      invoiceNumber
      status
      createdAt
      updatedAt
      template {
        id
        name
      }
    }
  }
`

export const GENERATE_INVOICE = gql`
  mutation GenerateInvoice($input: GenerateInvoiceInput!) {
    generateInvoice(input: $input) {
      id
      invoiceNumber
      schema
      rdlContent
      status
      createdAt
    }
  }
`

export const UPDATE_INVOICE_STATUS = gql`
  mutation UpdateInvoiceStatus($id: ID!, $status: InvoiceStatus!) {
    updateInvoiceStatus(id: $id, status: $status) {
      id
      invoiceNumber
      status
      updatedAt
    }
  }
`

export const DELETE_INVOICE = gql`
  mutation DeleteInvoice($id: ID!) {
    deleteInvoice(id: $id)
  }
`
