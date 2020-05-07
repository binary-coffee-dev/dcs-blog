module.exports = {
  query: `
    postByName(name: String!): Post!
    countPosts(where: JSON): Int!
    similarPosts(id: String!, limit: Int): [Post]!
  `,
  resolver: {
    Query: {
      postByName: {
        resolver: 'Post.findOneByName'
      },
      countPosts: {
        resolver: 'Post.count'
      },
      similarPosts: {
        resolver: 'Post.findSimilarPosts'
      }
    },
    Mutation: {
      createPost: {
        resolver: 'Post.create',
        policies: [
          'global.createPost'
        ]
      },
      updatePost: {
        resolver: 'Post.update',
        policies: [
          'global.canModifyPost'
        ]
      }
    }
  }
};
