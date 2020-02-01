module.exports = {
  definition: `
    input SubscribeInput {
      email: String
    }
  `,
  mutation: `subscribe(input: SubscribeInput): Subscription`,
  resolver: {
    Query: {
    },
    Mutation: {
      subscribe: {
        resolver: 'Subscription.subscribe'
      }
    }
  }
};
