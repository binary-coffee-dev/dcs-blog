'use strict';

/**
 * `canPublishPost` policy.
 */

module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx)) {
    ctx.request.body.published_at = null;
  }
  return await next();
};
