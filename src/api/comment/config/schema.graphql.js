const canRemove = require('../policies/canRemove');
const canComment = require('../policies/canComment');
const canUpdateComment = require('../policies/canUpdateComment');

module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({ nexus }) => {
    const recentComments = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('recentComments', {
          type: nexus.nonNull(nexus.list('Comment')),

          args: { limit: 'Int' },

          resolve(parent, args) {
            const { limit } = args;
            return strapi.service('api::comment.comment').recentComments(limit);
          }
        });
      }
    });

    return { types: [recentComments] };
  });

  extensionService.use(() => ({
    resolversConfig: {
      'Query.recentComments': {
        auth: {
          scope: ['api::comment.comment.recentComments']
        }
      },
      'Mutation.deleteComment': {
        policies: [canRemove]
      },
      'Mutation.createComment': {
        policies: [canComment]
      },
      'Mutation.updateComment': {
        policies: [canUpdateComment],
        auth: {
          scope: ['api::comment.comment.update']
        }
      }
    }
  }));
};
