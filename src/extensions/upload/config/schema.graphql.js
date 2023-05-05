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

/*
module.exports = {
  definition: `
    type UploadFileSchema {
      values: [UploadFile]
      groupBy: UploadFileGroupBy
      aggregate: UploadFileAggregator
    }
  `,
  query: `
    uploadsConnection(sort: String, limit: Int, start: Int, where: JSON): UploadFileSchema
    countUploads: Int!
  `,
  resolver: {
    Query: {
      uploadsConnection: {
        resolver: 'plugins::upload.upload.findConnection'
      },
      countUploads: {
        resolver: 'plugins::upload.upload.count'
      }
    },
    Mutation: {
      deleteFile: {
        resolver: 'plugins::upload.upload.destroy',
        policies: ['canRemoveFile']
      }
    }
  }
};
*/
