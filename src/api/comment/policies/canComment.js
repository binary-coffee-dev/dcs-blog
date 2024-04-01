'use strict';

module.exports = async (ctx, config, {strapi}) => {
  if (!(ctx && ctx.state && ctx.state.user)) {
    return false;
  }
  if (!strapi.service('api::post.post').isAdmin(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const commentsCount = await strapi.query('api::comment.comment').count({
      where: {
        $and: [
          {createdAt: {$lte: nextDay}},
          {createdAt: {$gte: startOfDay}}
        ],
        user: ctx.state.user.id
      }
    });
    if (commentsCount >= strapi.config.custom.maxNumberOfCommentsPerDay) {
      console.log('Limit of comments by post');
      return false;
    }
  }
  ctx.args.data.user = ctx.state.user.id;
  return true;
};
