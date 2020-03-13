module.exports = {
  definition: `
    type UsersPermissionsMYData {
      id: ID!
      username: String!
      email: String!
      avatarUrl: String!
      confirmed: Boolean
      blocked: Boolean
      role: UsersPermissionsMeRole
      page: String
      avatar: UploadFile
    }
  `,
  query: 'myData: UsersPermissionsMYData',
  mutation: 'loginWithProvider(provider: String!, code: String!): String',
  resolver: {
    Query: {
      myData: {
        resolver: {
          plugin: 'users-permissions',
          handler: 'User.me'
        }
      }
    },
    Mutation: {
      loginWithProvider: {
        resolver: {
          plugin: 'users-permissions',
          handler: 'Auth.loginWithProvider'
        }
      }
    }
  }
};
