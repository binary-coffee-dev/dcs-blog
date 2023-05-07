module.exports = () => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(() => ({
    resolversConfig: {
      'Query.imagesConnection': {
        policies: ['findExtra']
      }
    }
  }));
};
