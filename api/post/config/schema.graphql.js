module.exports = {
  query: `
    postByName(name: String!): Post!
    countPosts(where: JSON): Int!
    similarPosts(id: ID!, limit: Int): [Post]!
  `,
  resolver: {
    Query: {
      postByName: {
        resolver: 'application::post.post.findOneByName'
      },
      countPosts: {
        resolver: 'application::post.post.count'
      },
      similarPosts: {
        resolver: 'application::post.post.findSimilarPosts'
      }
    },
    Mutation: {
      createPost: {
        resolver: 'application::post.post.create',
        policies: [
          'global::createPost',
          'canPublishPost',
          'canCreatePost'
        ]
      },
      updatePost: {
        resolver: 'application::post.post.update',
        policies: [
          'global::canModifyPost',
          'canPublishPost'
        ]
      }
    }
  }
};
