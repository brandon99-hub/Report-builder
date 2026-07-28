import { gql } from '@apollo/client'

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      name
      image
      createdAt
      updatedAt
    }
  }
`

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      name
      image
      createdAt
      updatedAt
    }
  }
`

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      name
      image
      updatedAt
    }
  }
`
