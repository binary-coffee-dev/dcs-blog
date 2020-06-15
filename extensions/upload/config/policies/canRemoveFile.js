'use strict';

/**
 * `canRemoveFile` policy.
 */

module.exports = async (ctx, next) => {
  if (strapi.services.post.isAdmin(ctx) || strapi.services.post.isStaff(ctx)) {
    return await next();
  }
  if (ctx.state.user) {
    const image = await strapi.services.image.findOne({user: ctx.state.user});
    if (image) {
      return await next();
    }
  }
  return ctx.forbidden();
};
