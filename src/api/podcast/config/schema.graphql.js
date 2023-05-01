const canRemove = require("../../comment/policies/canRemove");
const canComment = require("../../comment/policies/canComment");
const canUpdateComment = require("../../comment/policies/canUpdateComment");
module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({ nexus }) => {
    const podcastByIdentifier = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('podcastByIdentifier', {
          type: nexus.nonNull('Podcast'),
          args: { identifier: nexus.nonNull('String') },

          resolve(parent, args, context) {
            const {identifier} = args;
            return strapi.service('api::podcast.podcast').findOneByIdentifier(identifier);
          }
        });
      }
    });

    return { types: [podcastByIdentifier] };
  });

  extensionService.use(() => ({
    resolversConfig: {
      'Query.podcastByIdentifier': {
        auth: {
          scope: ['api::podcast.podcast.podcastByIdentifier']
        }
      }
    }
  }));
};

/*
module.exports = {
  query: `
    podcastByIdentifier(identifier: String!): Podcast!
  `,
  resolver: {
    Query: {
      podcastByIdentifier: {
        resolver: 'application::podcast.podcast.podcastByIdentifier'
      }
    }
  }
};
*/