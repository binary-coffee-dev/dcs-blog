module.exports = {
  definition: `
    type UsersPermissionsUser2 {
      id: ID!
      createdAt: DateTime!
      updatedAt: DateTime!
      username: String!
      confirmed: Boolean
      blocked: Boolean
      role: UsersPermissionsRole
      avatar: UploadFile
      avatarUrl: String
      name: String
      page: String
      comments: Int
      posts: Int
    }
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
    users2(sort: String, limit: Int, start: Int, where: JSON, publicationState: PublicationState): [UsersPermissionsUser2]
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
      },
      users2: {
        resolver: 'plugins::users-permissions.user.find2'
      }
    },
    Mutation: {
      loginWithProvider: {
        resolver: 'plugins::users-permissions.auth.loginWithProvider'
      }
    }
  }
};
