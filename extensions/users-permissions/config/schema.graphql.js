module.exports = {
  definition: `
    type UsersPermissionsMYData {
      id: ID!
      username: String!
      email: String
      avatarUrl: String!
      confirmed: Boolean
      blocked: Boolean
      role: UsersPermissionsMeRole
      page: String
      avatar: UploadFile
    }
    type TopUsers {
      users: [UsersPermissionsUser]
      values: [Int]
    }
  `,
  query: `
    myData: UsersPermissionsMYData
    topActiveUsers: TopUsers!
    topPopularUsers: TopUsers!
  `,
  mutation: 'loginWithProvider(provider: String!, code: String!): String',
  resolver: {
    Query: {
      myData: {
        resolver: 'plugins::users-permissions.user.me'
      },
      topActiveUsers: {
        resolver: 'plugins::users-permissions.user.topActiveUsers'
      },
      topPopularUsers: {
        resolver: 'plugins::users-permissions.user.topPopularUsers'
      }
    },
    Mutation: {
      loginWithProvider: {
        resolver: 'plugins::users-permissions.auth.loginWithProvider'
      }
    }
  }
};
