'use strict';

module.exports = async (ctx, config, { strapi }) => {
  if (!strapi.service('api::post.post').isAdmin(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const commentsCount = await strapi.query('api::comment.comment').count({
      $and: [
        {createdAt: {$lte: nextDay}},
        {createdAt: {$gte: startOfDay}}
      ],
      user: ctx.state.user.id
    });
    if (commentsCount >= strapi.config.custom.maxNumberOfCommentsPerDay) {
      console.log('Limit of comments by post');
      return false;
    }
  }
  return true;
};
