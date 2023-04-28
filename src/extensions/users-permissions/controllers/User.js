'use strict';

const User = require('strapi-plugin-users-permissions/controllers/User');
const {sanitizeEntity} = require('strapi-utils');

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
      const providers = await strapi.query('provider').find({'user': ctx.body.id});
      const provider = providers[FIRST_PROVIDER];
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
      await strapi.query('user', 'users-permissions').update({id: user.id}, user);
    }
    ctx.send(user);
  },

  async topPopularUsers(ctx) {
    const {users, values} = await strapi.plugins['users-permissions'].services.user.topPopularUsers();

    ctx.send({
      users: users.map(u => sanitizeEntity(u || {}, {model: strapi.plugins['users-permissions'].models.user})),
      values
    });
  },

  async topActiveUsers(ctx) {
    const {users, values} = await strapi.plugins['users-permissions'].services.user.topActiveUsers();

    ctx.send({
      users: users.map(u => sanitizeEntity(u || {}, {model: strapi.plugins['users-permissions'].models.user})),
      values
    });
  }
};

module.exports = UserNew;
