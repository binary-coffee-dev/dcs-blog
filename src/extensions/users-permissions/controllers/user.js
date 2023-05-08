'use strict';

module.exports = (controller) => {
  controller.users = async function () {
    // toDo 01.05.23, guille,
    return [];
  };

  const oldFindFunction = controller.find;
  controller.find = async function (ctx, next, {populate} = {}) {
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
  controller.me = async function (ctx) {
    await oldMeFunction(ctx);
    if (!ctx.body.avatar) {
      const FIRST_PROVIDER = 0;
      const providers = await strapi.query('api::provider.provider').findMany({user: ctx.body.id});
      const provider = providers[FIRST_PROVIDER];
      ctx.body.avatar = {
        url: provider.avatar
      };
    }
    return ctx.body;
  };

  const oldUpdateFunction = controller.update;
  controller.update = async function (ctx) {
    await oldUpdateFunction(ctx);
    let user = await strapi.query('plugin::users-permissions.user').findOne({
      where: {id: ctx.params.id},
      populate: ['avatar']
    });
    if (user.avatar) {
      await strapi.query('plugin::users-permissions.user')
        .update({where: {id: user.id}, data: {avatarUrl: user.avatar.url}});
      user = await strapi.query('plugin::users-permissions.user').findOne({
        where: {id: ctx.params.id},
        populate: true
      });
    }
    ctx.send(user);
  };

  controller.topPopularUsers = async function (ctx) {
    const {users, values} = await strapi.service('plugin::users-permissions.user').topPopularUsers();

    ctx.send({
      users: users.map(u => controller.sanitizeOutput(u || {}, ctx)),
      values
    });
  };

  controller.topActiveUsers = async function (ctx) {
    const {users, values} = await strapi.service('plugin::users-permissions.user').topActiveUsers();

    ctx.send({
      users: users.map(u => controller.sanitizeOutput(u || {}, ctx)),
      values
    });
  };
};
