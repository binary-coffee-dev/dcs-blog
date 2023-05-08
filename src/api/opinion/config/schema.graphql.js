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
