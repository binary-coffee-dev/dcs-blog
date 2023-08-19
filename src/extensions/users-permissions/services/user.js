function buildSortObject(sort) {
  if (!sort) {
    sort = [];
  }
  return sort.reduce((p, v) => {
    const vs = v.split(':');
    if (vs.length === 2) {
      p[vs[0]] = vs[1];
    }
    return p;
  }, {});
}

const keys = ['and', 'or', 'in', 'ne', 'not', 'contains', 'eq', 'lte', 'lt', 'gt', 'gte'].reduce((p, v) => {
  p.add(v);
  return p;
}, new Set());

function buildWhereObject(obj) {
  if (obj === undefined || obj === null) {
    return obj;
  } else if (typeof obj === 'object') {
    for (let k of Object.keys(obj)) {
      buildWhereObject(obj[k]);
      if (keys.has(k)) {
        obj['$' + k] = obj[k];
        delete obj[k];
      }
    }
  } else if (Array.isArray(obj)) {
    for (let v of obj) {
      buildWhereObject(v);
    }
  }
  return obj;
}

module.exports = (services) => {
  // const oldService = services.other;

  services.extra = ({strapi}) => ({
    async topActiveUsers() {
      const limit = strapi.config.custom.maxNumberOfTopUsers;
      const usersQuery = await strapi.db.connection
        .raw('SELECT u.id,\n       (SELECT COUNT(p.id)\n        FROM posts AS p\n                 INNER JOIN posts_author_links AS pu ON p.id = pu.post_id\n        WHERE pu.user_id = u.id\n          AND enable = 1\n          AND published_at <= ?) AS counter\nFROM up_users AS u\nORDER BY counter DESC\nlimit ?;',
          [new Date(), limit]);
      if (process.env.NODE_ENV === 'test') {
        return this.getTopUserFormatted(usersQuery);
      } else {
        return this.getTopUserFormatted(usersQuery[0]);
      }
    },

    async topPopularUsers() {
      const limit = strapi.config.custom.maxNumberOfTopUsers;
      const usersQuery = await strapi.db.connection
        .raw('SELECT u.id,\n       (SELECT SUM(likes)\n        FROM posts AS p\n                 INNER JOIN posts_author_links AS pu ON p.id = pu.post_id\n        WHERE pu.user_id = u.id\n          AND enable = 1\n          AND published_at <= ?) AS counter\nFROM up_users AS u\nORDER BY counter DESC\nlimit ?;',
          [new Date(), limit]);
      if (process.env.NODE_ENV === 'test') {
        return this.getTopUserFormatted(usersQuery);
      } else {
        return this.getTopUserFormatted(usersQuery[0]);
      }
    },

    async myData(ctx) {
      const me = await strapi.query('plugin::users-permissions.user').findOne({
        where: {id: ctx.state.user.id},
        populate: ['role', 'avatar']
      });
      if (!me.avatar) {
        const providers = await strapi.query('api::provider.provider').findMany({where: {'user': me.id}});
        if (providers && providers.length) {
          const FIRST_PROVIDER = 0;
          const provider = providers[FIRST_PROVIDER];
          me.avatar = {
            url: provider.avatar
          };
        }
      }
      return me;
    },

    async getTopUserFormatted(usersQuery) {
      let users = await strapi.query('plugin::users-permissions.user').findMany({
        where: {
          id: {$in: usersQuery.map(u => u.id)}
        },
        populate: ['role', 'avatar']
      });
      const ma = usersQuery.reduce((p, v) => {
        p.set(v.id, +v.counter);
        return p;
      }, new Map());
      users = users.sort((a, b) => ma.get(b.id) - ma.get(a.id));
      const values = usersQuery.map(v => +v.counter);
      return {users: users.map(data => ({data})), values};
    },

    async users(args) {
      const users = await strapi.query('plugin::users-permissions.user').findMany({
        where: buildWhereObject(args.filters || {}),
        limit: args.pagination.limit,
        start: args.pagination.start,
        orderBy: buildSortObject(args.sort),
        populate: ['role', 'avatar']
      });
      for (let user of users) {
        user.posts = await strapi.query('api::post.post').count({
          where: {
            author: user.id,
            publishedAt: {$lte: new Date()},
            enable: true
          }
        });
        user.comments = await strapi.query('api::comment.comment').count({
          where: {
            user: user.id,
            post: {enable: true, publishedAt: {$lte: new Date()}}
          }
        });
      }
      return users;
    },

    async findOrCreateProvide({username, provider, scope, avatar, html_url, name, token}) {
      let provide = await strapi.query('api::provider.provider').findOne({where: {username, provider}, populate: ['user']});
      if (!provide) {
        provide = await strapi.query('api::provider.provider').create({
          data: {
            username,
            provider,
            scope,
            avatar,
            url: html_url,
            name,
            token
          }
        });
      }
      return provide;
    },

    async createUserByProvider(provider, email) {
      let user, username = provider.username, count = 2;
      do {
        user = await strapi.query('plugin::users-permissions.user').findOne({where: {username}});
        if (user) {
          username = provider.username + (count++);
        }
      } while (user);
      const authenticatedRole = await strapi.query('plugin::users-permissions.role').findOne({where: {type: 'authenticated'}});
      return await strapi.query('plugin::users-permissions.user').create({
        data: {
          username,
          confirmed: true,
          blocked: false,
          name: provider.name || username,
          page: provider.url,
          avatarUrl: provider.avatar,
          providers: [provider.id],
          role: authenticatedRole.id,
          email
        }
      });
    },

    provider: {
      github: {
        auth: () => strapi.service('api::provider.provider').github.auth,
        user: () => strapi.service('api::provider.provider').github.user
      }
    }
  });
};

module.exports.buildSortObject = buildSortObject;
module.exports.buildWhereObject = buildWhereObject;
