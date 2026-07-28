import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }: any) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }: any) =>
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            )
        )
    }
    if (networkError) {
        console.error(`[Network error]: ${networkError}`)
    }
})

// HTTP link
const httpLink = new HttpLink({
    uri: '/api/graphql',
    credentials: 'same-origin',
})

// Create Apollo Client
export const apolloClient = new ApolloClient({
    link: from([errorLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    templates: {
                        keyArgs: ['category', 'search'],
                        merge(existing, incoming, { args }) {
                            if (!existing || args?.offset === 0) {
                                return incoming
                            }
                            return {
                                ...incoming,
                                edges: [...(existing.edges || []), ...(incoming.edges || [])],
                            }
                        },
                    },
                    invoices: {
                        keyArgs: ['status'],
                        merge(existing, incoming, { args }) {
                            if (!existing || args?.offset === 0) {
                                return incoming
                            }
                            return {
                                ...incoming,
                                edges: [...(existing.edges || []), ...(incoming.edges || [])],
                            }
                        },
                    },
                },
            },
        },
    }),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-and-network',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all',
        },
    },
})
