'use strict';

/**
 * `canComment` policy.
 */

module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const commentsCount = await strapi.models.comment.count({
      createdAt: {$gte: startOfDay, $lt: nextDay},
      post: ctx.request.body.post,
      user: ctx.state.user.id
    });
    if (commentsCount < 20) {
      return await next();
    }
    ctx.forbidden('Limit of comments by post');
    throw new Error('Limit of comments by post');
  }
  await next();
};
