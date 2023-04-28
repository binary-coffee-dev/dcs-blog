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
            return strapi.service('api::podcast.podcast').podcastByIdentifier(context);
          }
        });
      }
    });

    return { types: [podcastByIdentifier] };
  });
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
