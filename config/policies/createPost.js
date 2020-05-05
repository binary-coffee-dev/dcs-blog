'use strict';

/**
 * `createPost` policy.
 */

module.exports = async (ctx, next) => {
  if (!strapi.services.post.isStaff(ctx) && !strapi.services.post.isAdmin(ctx)) {
    delete ctx.request.body.tags;
  }
  return await next();
};
