const canRemoveFile = require('../policies/canRemoveFile');

module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(() => ({
    resolversConfig: {
      'Mutation.removeFile': {
        policies: [canRemoveFile]
      }
    }
  }));
};
