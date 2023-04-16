'use strict';

/**
 * `canPublishPost` policy.
 */

module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx)) {
    delete ctx.request.body.published_at;
  }
  return await next();
};
