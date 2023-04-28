module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({ nexus }) => {
    const recentComments = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('recentComments', {
          type: nexus.nonNull(nexus.list('Comment')),

          args: { limit: 'Int' },

          resolve(parent, args, context) {
            // const { limit } = args;
            return strapi.service('api::comment.comment').recentComments(context);
          }
        });
      }
    });

    return { types: [recentComments] };
  });

  extensionService.use(() => ({
    resolversConfig: {
      'Mutation.deleteComment': {
        policies: ['comment::canRemove']
      },
      'Mutation.createComment': {
        policies: ['comment::canComment']
      },
      'Mutation.updateComment': {
        policies: ['comment::canUpdateComment']
      }
    }
  }));
};

/*{
  query: 'recentComments(limit: Int): [Comment]!',
  resolver: {
    Query: {
      recentComments: {
        resolver: 'application::comment.comment.recentComments'
      }
    },
    Mutation: {
      deleteComment: {
        resolver: 'application::comment.comment.delete',
        policies: ['canRemove']
      },
      createComment: {
        resolver: 'application::comment.comment.create',
        policies: ['canComment']
      },
      updateComment: {
        resolver: 'application::comment.comment.update',
        policies: ['canUpdateComment']
      },
    }
  }
};*/
