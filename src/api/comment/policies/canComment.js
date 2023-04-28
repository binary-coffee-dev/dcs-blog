'use strict';

module.exports = async (ctx, config, { strapi }) => {
  if (!strapi.service('api::post.post').isAdmin(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const commentsCount = await strapi.query('comment').count({
      created_at_lte: nextDay,
      created_at_gte: startOfDay,
      post: ctx.request.body.post.id,
      user: ctx.state.user.id
    });
    if (commentsCount >= strapi.config.custom.maxNumberOfCommentsPerDay) {
      console.log('Limit of comments by post');
      return false;
    }
  }
  return true;
};
