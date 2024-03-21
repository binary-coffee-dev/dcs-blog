'use strict';

// toDo (gonzalezext)[28.04.23]: middleware needed

module.exports = async (ctx, config, {strapi}) => {
  ctx.args.data.title = strapi.service('api::post.post').removeExtraSpaces(ctx.args.data.title);
  if (ctx.args.data.title === '') {
    console.info('Empty title is not allowed');
    return false;
  }
  if (!strapi.service('api::post.post').isAdmin(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const postCount = await strapi.query('api::post.post').count({
      where: {
        author: ctx.state.user.id,
        $and: [
          {createdAt: {$lte: nextDay}},
          {createdAt: {$gte: startOfDay}}
        ]
      }
    });
    if (postCount >= strapi.config.custom.maxNumberOfArticlesPerDay) {
      console.info('Limit of posts by user');
      return false;
    }
    // set the current session as author of the post
    ctx.args.data.author = ctx.state.user.id;
  }
  if (!strapi.service('api::post.post').isStaff(ctx) && !strapi.service('api::post.post').isAdmin(ctx)) {
    delete ctx.args.data.tags;
  }
  return true;
};
