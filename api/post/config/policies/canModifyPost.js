'use strict';

/**
 * `canModifyPost` policy.
 */

module.exports = async (ctx, next) => {
  ctx.request.body.title = strapi.services.post.removeExtraSpaces(ctx.request.body.title);
  if (ctx.request.body.title === '') {
    ctx.forbidden('Empty title is not allowed');
    throw new Error('Empty title is not allowed');
  }
  if (strapi.services.post.isStaff(ctx) || strapi.services.post.isAdmin(ctx)) {
    return await next();
  } else if (strapi.services.post.isAuthenticated(ctx) && ctx.params.id) {
    const post = await strapi.query('post').findOne({id: ctx.params.id});
    if (Boolean(post.author) && post.author.id === ctx.state.user.id) {
      delete ctx.request.body.tags;
      delete ctx.request.body.author;
      return await next();
    }
  }
  ctx.unauthorized('Wrong permissions');
};
