module.exports = {
  query: `
    postByName(name: String!): Post!
    countPosts(where: JSON): Int!
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
