module.exports = {
  definition: `
    input SubscribeInput {
      email: String
    }
  `,
  mutation: `
    subscribe(input: SubscribeInput): Subscription
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
