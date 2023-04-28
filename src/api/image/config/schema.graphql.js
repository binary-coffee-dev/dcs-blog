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

/*module.exports = {
  resolver: {
    Query: {
      imagesConnection: {
        resolver: 'application::image.image.findExtra',
      }
    }
  }
};*/
