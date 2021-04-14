'use strict';

/**
 * `canModifyPost` policy.
 */

module.exports = async (ctx, next) => {
  if (strapi.services.post.isStaff(ctx) || strapi.services.post.isAdmin(ctx)) {
    return await next();
  } else if (strapi.services.post.isAuthenticated(ctx) && ctx.params.id) {
    const post = await strapi.services.post.findOne({id: ctx.params.id});
    if (Boolean(post.author) && post.author.id === ctx.state.user.id) {
      delete ctx.request.body.tags;
      delete ctx.request.body.author;
      return await next();
    }
  }
  ctx.unauthorized('Wrong permissions');
};
