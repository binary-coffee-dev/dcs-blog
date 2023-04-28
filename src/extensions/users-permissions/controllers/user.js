'use strict';

module.exports = (controller) => {
  controller.find2 = async function(ctx, next, {populate} = {}) {
    await this.find(ctx, next, {populate});

    for (let i = 0; i < ctx.body.length; i++) {
      const user = ctx.body[i];
      user.comments = await strapi.query('comment').count({user: user.id});
      user.posts = await strapi.query('api::post.post').count({
        author: user.id,
        published_at_lte: new Date(),
        enable: true
      });
    }
  };

  const oldFindFunction = controller.find;
  controller.find = async function(ctx, next, {populate} = {}) {
    if (ctx.query.username) {
      ctx.query.username_contains = ctx.query.username;
      delete ctx.query.username;
    }

    await oldFindFunction(ctx, next, {populate});
    if (ctx.body) {
      ctx.body = ctx.body
        .filter(v => !!v)
        .map(v => ({...v, email: ''}));
    }
  };

  const oldMeFunction = controller.me;
  controller.me = async function(ctx) {
    await oldMeFunction(ctx);
    if (!ctx.body.avatar) {
      const FIRST_PROVIDER = 0;
      const providers = await strapi.query('provider').find({'user': ctx.body.id});
      const provider = providers[FIRST_PROVIDER];
      ctx.body.avatar = {
        url: provider.avatar
      };
    }
  };

  const oldUpdateFunction = controller.update;
  controller.update = async function(ctx) {
    await oldUpdateFunction(ctx);
    const user = await strapi.query('plugin::users-permissions.user').findOne({id: ctx.params.id});
    if (user.avatar) {
      user.avatarUrl = user.avatar.url;
      await strapi.query('plugin::users-permissions.user').update({id: user.id}, user);
    }
    ctx.send(user);
  };

  controller.topPopularUsers = async function(ctx) {
    const {users, values} = await strapi.service('plugin::users-permissions.user').topPopularUsers();

    ctx.send({
      users: users.map(u => controller.sanitizeOutput(u || {}, ctx)),
      values
    });
  };

  controller.topActiveUsers = async function(ctx) {
    const {users, values} = await strapi.service('plugin::users-permissions.user').topActiveUsers();

    ctx.send({
      users: users.map(u => controller.sanitizeOutput(u || {}, ctx)),
      values
    });
  };
};
