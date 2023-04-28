module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({nexus}) => {
    const UsersPermissionsUser2 = nexus.objectType({
      name: 'UsersPermissionsUser2',
      definition(t) {
        t.id('id');
        t.field('created_at', {type: 'DateTime'});
        t.field('updated_at', {type: 'DateTime'});
        t.string('username');
        t.boolean('confirmed');
        t.boolean('blocked');
        t.field('role', {type: 'UsersPermissionsRole'});
        t.field('avatar', {type: 'UploadFile'});
        t.string('avatarUrl');
        t.string('name');
        t.string('page');
        t.int('comments');
        t.int('posts');
      }
    });

    const UsersPermissionsMYData = nexus.objectType({
      name: 'UsersPermissionsMYData',
      definition(t) {
        t.id('id');
        t.string('username');
        t.string('email');
        t.string('avatarUrl');
        t.boolean('confirmed');
        t.boolean('blocked');
        t.field('role', {type: 'UsersPermissionsRole'});
        t.string('page');
        t.field('avatar', {type: 'UploadFile'});
      }
    });

    const TopUsers = nexus.objectType({
      name: 'TopUsers',
      definition(t) {
        t.list.field('users', {type: 'UsersPermissionsUser'});
        t.int('values');
      }
    });

    const myData = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('myData', {
          type: nexus.nonNull('UsersPermissionsMYData'),
          resolve(parent, args, context) {
            return strapi.controller('plugin::users-permissions.user').me(context);
          }
        });
      }
    });

    const topActiveUsers = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('topActiveUsers', {
          type: nexus.nonNull('TopUsers'),
          resolve(parent, args, context) {
            return strapi.controller('plugin::users-permissions.user').topActiveUsers(context);
          }
        });
      }
    });

    const topPopularUsers = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('topPopularUsers', {
          type: nexus.nonNull('TopUsers'),
          resolve(parent, args, context) {
            return strapi.controller('plugin::users-permissions.user').topPopularUsers(context);
          }
        });
      }
    });

    const users2 = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('users2', {
          type: nexus.nonNull(nexus.list('UsersPermissionsUser2')),
          args: {sort: 'String', limit: 'Int', start: 'Int', where: 'JSON', publicationState: 'PublicationState'},
          resolve(parent, args, context) {
            return strapi.controller('plugin::users-permissions.user').find2(context);
          }
        });
      }
    });

    const loginWithProvider = nexus.extendType({
      type: 'Mutation',
      definition(t) {
        t.field('loginWithProvider', {
          type: nexus.nonNull('String'),
          args: {provider: nexus.nonNull('String'), code: nexus.nonNull('String')},
          resolve(parent, args, context) {
            return strapi.controller('plugin::users-permissions.auth').loginWithProvider(context);
          }
        });
      }
    });

    return {types: [UsersPermissionsUser2, UsersPermissionsMYData, TopUsers, myData, topActiveUsers, topPopularUsers, users2, loginWithProvider]};
  });
};

/*
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
*/
