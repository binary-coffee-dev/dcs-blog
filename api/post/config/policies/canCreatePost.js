'use strict';

const MAX_NUMBER_OF_POST = 5;

/**
 * `canCreatePost` policy.
 */
module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const postCount = await strapi.models.post.count({
      createdAt: {$gte: startOfDay, $lt: nextDay},
      author: ctx.request.body.post
    });
    console.log(postCount)
    if (postCount >= MAX_NUMBER_OF_POST) {
      ctx.forbidden('Limit of posts by user');
      throw new Error("Limit of posts by user");
    }
  }
  return await next();
};
