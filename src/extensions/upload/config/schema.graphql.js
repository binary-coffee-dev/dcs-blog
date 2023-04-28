const canRemoveFile = require('../policies/canRemoveFile');

module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({nexus}) => {
    const UploadFileSchema = nexus.objectType({
      name: 'UploadFileSchema',
      definition(t) {
        t.list.field('values', {type: 'UploadFile'});
        t.field('groupBy', {type: 'UploadFileGroupBy'});
        t.field('aggregate', {type: 'UploadFileAggregator'});
      }
    });

    const uploadsConnection = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('uploadsConnection', {
          type: nexus.nonNull('UploadFileSchema'),
          args: {sort: 'String', limit: 'Int', start: 'Int', where: 'JSON'},
          resolve(parent, args, context) {
            return strapi.controller('plugins::upload.content-api').findConnection(context);
          }
        });
      }
    });

    const countUploads = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('countUploads', {
          type: nexus.nonNull('Int'),
          resolve(parent, args, context) {
            return strapi.controller('plugins::upload.content-api').count(context);
          }
        });
      }
    });

    return {types: [UploadFileSchema, uploadsConnection, countUploads]};
  });

  extensionService.use(() => ({
    resolversConfig: {
      'Mutation.deleteFile': {
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
