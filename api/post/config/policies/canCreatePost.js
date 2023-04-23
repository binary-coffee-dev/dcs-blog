'use strict';

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
    const postCount = await strapi.query('post').count({
      author_eq: ctx.state.user.id,
      created_at_lte: nextDay,
      created_at_gte: startOfDay
    });
    if (postCount >= strapi.config.custom.maxNumberOfArticlesPerDay) {
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
