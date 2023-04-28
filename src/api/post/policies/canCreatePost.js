'use strict';

// toDo (gonzalezext)[28.04.23]: middleware needed

module.exports = async (ctx, config, { strapi }) => {
  ctx.request.body.title = strapi.service('api::post.post').removeExtraSpaces(ctx.request.body.title);
  if (ctx.request.body.title === '') {
    console.log('Empty title is not allowed');
    return false;
  }
  if (!strapi.service('api::post.post').isAdmin(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const postCount = await strapi.query('api::post.post').count({
      author_eq: ctx.state.user.id,
      created_at_lte: nextDay,
      created_at_gte: startOfDay
    });
    if (postCount >= strapi.config.custom.maxNumberOfArticlesPerDay) {
      console.log('Limit of posts by user');
      return false;
    }
    // set the current session as author of the post
    ctx.request.body.author = ctx.state.user.id;
  }
  if (!strapi.service('api::post.post').isStaff(ctx) && !strapi.service('api::post.post').isAdmin(ctx)) {
    delete ctx.request.body.tags;
  }
  return true;
};
