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
        resolver: 'Subscription.subscribe'
      },
      verify : {
        resolver: 'Subscription.verify'
      }
    }
  }
};
