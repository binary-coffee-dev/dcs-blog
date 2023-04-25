module.exports = {
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
};
