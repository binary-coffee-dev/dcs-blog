module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({ nexus }) => {
    const subscribe = nexus.extendType({
      type: 'Mutation',
      definition(t) {
        t.field('subscribe', {
          type: nexus.nonNull('Subscription'),
          args: { email: nexus.nonNull('String') },

          resolve(parent, args, context) {
            return strapi.controller('api::subscription.subscription').subscribe(context);
          }
        });
      }
    });

    const verify = nexus.extendType({
      type: 'Mutation',
      definition(t) {
        t.field('verify', {
          type: nexus.nonNull('Subscription'),
          args: { token: nexus.nonNull('String') },

          resolve(parent, args, context) {
            return strapi.controller('api::subscription.subscription').verify(context);
          }
        });
      }
    });

    return { types: [subscribe, verify] };
  });
};

/*module.exports = {
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
};*/
