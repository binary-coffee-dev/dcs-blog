module.exports = {
  query: `
    postByName(name: String!): Post!
    countPosts: Int!
  `,
  resolver: {
    Query: {
      postByName: {
        resolver: 'Post.findOneByName'
      },
      countPosts: {
        resolver: 'Post.count'
      }
    }
  }
};
