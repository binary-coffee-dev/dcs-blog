'use strict';

/**
 * `canRemoveFile` policy.
 */

module.exports = async (ctx, next) => {
  if (strapi.services.post.isAdmin(ctx)) {
    return await next();
  }
  if (ctx.state.user) {
    const image = await strapi.services.image.findOne({user: ctx.state.user, image: [ctx.params.id]});
    if (image) {
      return await next();
    }
  }
  ctx.forbidden();
  throw new Error('Can not remove file');
};
