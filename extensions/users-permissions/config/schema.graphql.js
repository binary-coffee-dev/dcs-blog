module.exports = {
  definition: `
    type UsersPermissionsMYData {
      id: ID!
      username: String!
      email: String!
      confirmed: Boolean
      blocked: Boolean
      role: UsersPermissionsMeRole
      page: String
      avatar: UploadFile
    }
  `,
  query: `myData: UsersPermissionsMYData`,
  resolver: {
    Query: {
      myData: {
        resolver: {
          plugin: 'users-permissions',
          handler: 'User.me'
        }
      }
    }
  }
};
