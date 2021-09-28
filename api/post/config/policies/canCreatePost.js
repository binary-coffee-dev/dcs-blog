'use strict';

const MAX_NUMBER_OF_POST = 5;

/**
 * `canCreatePost` policy.
 */
module.exports = async (ctx, next) => {
  ctx.request.body.title = strapi.services.post.removeExtraSpaces(ctx.request.body.title);
  if (ctx.request.body.title === '') {
    ctx.forbidden('Empty title is not allowed');
    throw new Error('Empty title is not allowed');
  }
  if (!strapi.services.post.isAdmin(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const postCount = await strapi.models.post.count({
      createdAt: {$gte: startOfDay, $lt: nextDay},
      author: ctx.state.user.id
    });
    if (postCount >= MAX_NUMBER_OF_POST) {
      ctx.forbidden('Limit of posts by user');
      throw new Error('Limit of posts by user');
    }
    // set the current session as author of the post
    ctx.request.body.author = ctx.state.user.id;
  }
  if (!strapi.services.post.isStaff(ctx) && !strapi.services.post.isAdmin(ctx)) {
    delete ctx.request.body.tags;
  }
  return await next();
};
