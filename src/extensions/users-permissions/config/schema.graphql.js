module.exports = (strapi) => {
  const extensionService = strapi.plugin('graphql').service('extension');

  extensionService.use(({nexus}) => {
    const UsersPermissionsUser2 = nexus.objectType({
      name: 'UsersPermissionsUsersExtra',
      definition(t) {
        t.id('id');
        t.field('createdAt', {type: 'DateTime'});
        t.field('updatedAt', {type: 'DateTime'});
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

    const UsersPermissionsUserEntityRes = nexus.objectType({
      name: 'UsersPermissionsUserEntityRes',
      definition(t) {
        t.field('data', {type: 'UsersPermissionsUserEntity'});
      }
    });

    const TopUsers = nexus.objectType({
      name: 'TopUsers',
      definition(t) {
        t.list.field('users', {type: 'UsersPermissionsUserEntityRes'});
        t.list.field('values', {type: 'Int'});
      }
    });

    const topActiveUsers = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('topActiveUsers', {
          type: nexus.nonNull('TopUsers'),
          resolve(parent, args, context) {
            return strapi.service('plugin::users-permissions.extra').topActiveUsers(context);
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
            return strapi.service('plugin::users-permissions.extra').topPopularUsers(context);
          }
        });
      }
    });

    const myData = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('myData', {
          type: nexus.nonNull('UsersPermissionsMYData'),
          resolve(parent, args, context) {
            return strapi.service('plugin::users-permissions.extra').myData(context);
          }
        });
      }
    });

    const users = nexus.extendType({
      type: 'Query',
      definition(t) {
        t.field('users', {
          type: nexus.nonNull(nexus.list('UsersPermissionsUsersExtra')),
          args: {
            filters: 'UsersPermissionsUserFiltersInput',
            pagination: 'PaginationArg',
            sort: nexus.list('String')
          },
          resolve(parent, args) {
            return strapi.service('plugin::users-permissions.extra').users(args);
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
            return strapi.controller('plugin::users-permissions.extra').loginWithProvider(context);
          }
        });
      }
    });

    return {
      types: [UsersPermissionsUser2, UsersPermissionsMYData, UsersPermissionsUserEntityRes, TopUsers, myData, topActiveUsers, topPopularUsers,
        users, loginWithProvider]
    };
  });

  extensionService.use(() => ({
    resolversConfig: {
      'Query.users': {
        auth: {
          scope: ['plugin::users-permissions.user.users']
        }
      },
      'Query.myData': {
        auth: {
          scope: ['plugin::users-permissions.user.me']
        }
      },
      'Query.topActiveUsers': {
        auth: {
          scope: ['plugin::users-permissions.user.topActiveUsers']
        }
      },
      'Query.topPopularUsers': {
        auth: {
          scope: ['plugin::users-permissions.user.topPopularUsers']
        }
      }
    }
  }));
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
