'use strict';

/**
 * `canComment` policy.
 */
module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const commentsCount = await strapi.query('comment').count({
      created_at_lte: nextDay,
      created_at_gte: startOfDay,
      post: ctx.request.body.post.id,
      user: ctx.state.user.id
    });
    if (commentsCount >= strapi.config.custom.maxNumberOfCommentsPerDay) {
      ctx.forbidden('Limit of comments by post');
      throw new Error('Limit of comments by post');
    }
  }
  await next();
};
