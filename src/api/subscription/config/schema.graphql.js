module.exports = {
  mutation: `
    subscribe(email: String!): Subscription
    verify(token: String!): Subscription
  `,
  resolver: {
    Query: {
    },
    Mutation: {
      subscribe: {
        resolver: 'application::subscription.subscription.subscribe'
      },
      verify : {
        resolver: 'application::subscription.subscription.verify'
      }
    }
  }
};
