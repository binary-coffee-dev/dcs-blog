'use strict';

const getStartDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};

const getEndDay = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 1);
  return date;
};

/**
 * `canComment` policy.
 */

module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx)) {
    const startOfDay = getStartDay();
    const nextDay = getEndDay();
    const commentsCount = await strapi.models.comment.count({
      createdAt: {$gte: startOfDay, $lt: nextDay},
      post: ctx.request.body.post,
      user: ctx.state.user.id
    });
    if (commentsCount < 20) {
      return await next();
    }
  }
  ctx.forbidden('Limit of comments by post');
  throw new Error("Limit of comments by post");
};
