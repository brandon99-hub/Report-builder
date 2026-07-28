import { gql } from '@apollo/client'

export const GET_TEMPLATES = gql`
  query GetTemplates($category: TemplateCategory, $search: String, $limit: Int, $offset: Int) {
    templates(category: $category, search: $search, limit: $limit, offset: $offset) {
      edges {
        node {
          id
          name
          description
          category
          thumbnail
          usageCount
          rating
          createdAt
          createdBy {
            id
            name
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

export const GET_TEMPLATE = gql`
  query GetTemplate($id: ID!) {
    template(id: $id) {
      id
      name
      description
      category
      thumbnail
      rdlContent
      schema
      modules
      isPublic
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
    }
  }
`

export const GET_MY_TEMPLATES = gql`
  query GetMyTemplates {
    myTemplates {
      id
      name
      description
      category
      thumbnail
      isPublic
      usageCount
      rating
      createdAt
      updatedAt
    }
  }
`

export const CREATE_TEMPLATE = gql`
  mutation CreateTemplate($input: CreateTemplateInput!) {
    createTemplate(input: $input) {
      id
      name
      description
      category
      thumbnail
      schema
      modules
      isPublic
      createdAt
    }
  }
`

export const UPDATE_TEMPLATE = gql`
  mutation UpdateTemplate($id: ID!, $input: UpdateTemplateInput!) {
    updateTemplate(id: $id, input: $input) {
      id
      name
      description
      category
      thumbnail
      schema
      modules
      isPublic
      updatedAt
    }
  }
`

export const DELETE_TEMPLATE = gql`
  mutation DeleteTemplate($id: ID!) {
    deleteTemplate(id: $id)
  }
`

export const CLONE_TEMPLATE = gql`
  mutation CloneTemplate($id: ID!) {
    cloneTemplate(id: $id) {
      id
      name
      description
      category
      thumbnail
      schema
      modules
      createdAt
    }
  }
`
