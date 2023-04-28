const canCreateOpinion = require('../policies/canCreateOpinion');
const canRemoveOpinion = require('../policies/canRemoveOpinion');

module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(() => ({
    resolversConfig: {
      'Mutation.createOpinion': {
        policies: [canCreateOpinion]
      },
      'Mutation.deleteOpinion': {
        policies: [canRemoveOpinion]
      }
    }
  }));
};

/*module.exports = {
  query: `
    countOpinions(where: JSON): Int!
  `,
  resolver: {
    Query: {
      countOpinions: {
        resolver: 'application::opinion.opinion.count',
      }
    },
    Mutation: {
      createOpinion: {
        resolver: 'application::opinion.opinion.create',
        policies: [
          'canCreateOpinion'
        ]
      },
      deleteOpinion: {
        resolver: 'application::opinion.opinion.delete',
        policies: [
          'canRemoveOpinion'
        ]
      }
    }
  }
};*/
