'use strict';

/**
 * `canPublishPost` policy.
 */

module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx)) {
    delete ctx.request.body.publishedAt;
  }
  return await next();
};
