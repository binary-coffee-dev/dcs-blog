'use strict';

/**
 * `canModifyPost` policy.
 */

module.exports = async (ctx, next) => {
  if (strapi.services.post.isStaff(ctx)) {
    return await next();
  } else if (strapi.services.post.isAuthenticated(ctx) && ctx.params.id) {
    const post = await strapi.services.post.findOne({id: ctx.params.id});
    if (Boolean(post.author) && post.author.id === ctx.state.user.id) {
      return await next();
    }
  }
  ctx.unauthorized('Wrong permissions');
};
