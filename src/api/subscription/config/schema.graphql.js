const canSubscribe = require('../policies/canSubscribe');

module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({nexus}) => {
    const SubscribeResponse = nexus.objectType({
      name: 'SubscribeResponse',
      definition(t) {
        t.field('verified', {type: nexus.nonNull('Boolean')});
      }
    });

    const subscribe = nexus.extendType({
      type: 'Mutation',
      definition(t) {
        t.field('subscribe', {
          type: nexus.nonNull('SubscribeResponse'),
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
          type: nexus.nonNull('SubscribeResponse'),
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
          type: nexus.nonNull('SubscribeResponse'),
          args: {token: nexus.nonNull('String')},

          resolve(parent, args, context) {
            return strapi.service('api::subscription.subscription').verify({args, ctx: context});
          }
        });
      }
    });

    return {types: [SubscribeResponse, subscribe, unsubscribe, verify]};
  });

  extensionService.use(() => ({
    resolversConfig: {
      'Mutation.subscribe': {
        policies: [canSubscribe],
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
