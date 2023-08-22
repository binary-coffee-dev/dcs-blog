module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({nexus}) => {
    const subscribe = nexus.extendType({
      type: 'Mutation',
      definition(t) {
        t.field('subscribe', {
          type: nexus.nonNull('SubscriptionEntity'),
          args: {email: nexus.nonNull('String')},

          resolve(parent, args, context) {
            return strapi.service('api::subscription.subscription').subscribe({args, ctx: context});
          }
        });
      }
    });

    const unsubscribe = nexus.extendType({
      type: 'Mutation',
      definition(t) {
        t.field('unsubscribe', {
          type: nexus.nonNull('Subscription'),
          args: {unsubscribeToken: nexus.nonNull('String')},

          resolve(parent, args, context) {
            return strapi.service('api::subscription.subscription').unsubscribe({args, ctx: context});
          }
        });
      }
    });

    const verify = nexus.extendType({
      type: 'Mutation',
      definition(t) {
        t.field('verify', {
          type: nexus.nonNull('Subscription'),
          args: {token: nexus.nonNull('String')},

          resolve(parent, args, context) {
            return strapi.service('api::subscription.subscription').verify({args, ctx: context});
          }
        });
      }
    });

    return {types: [subscribe, unsubscribe, verify]};
  });

  extensionService.use(() => ({
    resolversConfig: {
      'Mutation.subscribe': {
        policies: [],
        auth: {
          scope: ['api::subscription.subscription.subscribe']
        }
      },
      'Mutation.unsubscribe': {
        policies: [],
        auth: {
          scope: ['api::subscription.subscription.unsubscribe']
        }
      },
      'Mutation.verify': {
        policies: [],
        auth: {
          scope: ['api::subscription.subscription.verify']
        }
      }
    }
  }));
};
