'use strict';

const User = require('strapi-plugin-users-permissions/controllers/User');
const {sanitizeEntity} = require("strapi-utils");

// toDo 04.04.21: in the future, add this method to the service file
const getUsersById = async (userIds) => {
  const users = await strapi.plugins['users-permissions'].models.user.find({
    _id: {
      $in: userIds.filter(v => v._id).map(v => v._id)
    }
  });
  const positions = new Map();
  userIds.forEach((u, i) => positions.set(u._id.toString(), i));
  users.sort((u1, u2) => positions.get(u1._id.toString()) > positions.get(u2._id.toString()));
  return users;
};

const UserNew = {
  ...User,

  async find2(ctx, next, {populate} = {}) {
    await UserNew.find(ctx, next, {populate});

    for (let i = 0; i < ctx.body.length; i++) {
      const user = ctx.body[i];
      user.comments = await strapi.query('comment').count({user: user.id});
      user.posts = await strapi.query('post').count({
        author: user.id,
        published_at_lte: new Date(),
        enable: true
      });
    }
  },

  async find(ctx, next, {populate} = {}) {
    if (ctx.query.username) {
      ctx.query.username_contains = ctx.query.username;
      delete ctx.query.username;
    }

    await User.find(ctx, next, {populate});
    if (ctx.body) {
      ctx.body = ctx.body
        .filter(v => !!v)
        .map(v => ({...v, email: ''}));
    }
  },

  async me(ctx) {
    await User.me(ctx);
    if (!ctx.body.avatar) {
      const FIRST_PROVIDER = 0;
      const providerId = ctx.state.user.providers[FIRST_PROVIDER];
      const provider = await strapi.query('provider').findOne({id: providerId});
      ctx.body.avatar = {
        url: provider.avatar
      };
    }
  },

  async update(ctx) {
    await User.update(ctx);
    const user = await strapi.query('user', 'users-permissions').findOne({id: ctx.params.id});
    if (user.avatar) {
      user.avatarUrl = user.avatar.url;
      await user.save();
    }
    ctx.send(user);
  },

  async topPopularUsers(ctx) {
    const topUsersIds = await strapi.models.post.aggregate([
      {$match: {'author': {$exists: true}}},
      {
        $group: {
          '_id': '$author',
          'likesCount': {$sum: '$likes'}
        }
      },
      {$sort: {'likesCount': -1}},
      {$limit: 5}
    ]);
    const users = await getUsersById(topUsersIds);
    ctx.send({users, values: topUsersIds.map(v => v.likesCount)});
  },

  async topActiveUsers(ctx) {
    let users;
    try {
      // users = await strapi.query('user', 'users-permissions').model.query(qb => {
      //   qb.select('articles', this.db.raw('(select count(id) from post where author=`users-permissions_user`.id) as count'));
      //   // qb.limit(5);
      // }).fetchAll();
      users = await strapi.connections.default.raw('select u.*, (select count(id) from post where author=u.id) as articles from `users-permissions_user` as u order by articles DESC limit 5;');
    } catch (e) {
      console.error(e);
    }
    // .populate({
    //   path: 'articles',
    //   populate: {
    //     path: '_count'
    //   }
    // });
    console.log()
    //   await strapi.models.post.aggregate([
    //   {$match: {'author': {$exists: true}, publishedAt: {$lte: new Date()}, enable: true}},
    //   {
    //     $group: {
    //       '_id': '$author',
    //       'postCount': {$sum: 1}
    //     }
    //   },
    //   {$sort: {'postCount': -1}},
    //   {$limit: 5}
    // ]);
    // const users = await getUsersById(topUsersIds);
    const values = users.map(v => v.articles);
    users = users.map(u => {
      u = sanitizeEntity(u || {}, {model: strapi.plugins['users-permissions'].models.user});
      delete u.articles;
      return u;
    });
    ctx.send({users, values});
  }
};

module.exports = UserNew;
