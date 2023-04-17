'use strict';

/**
 * `canUpdateComment` policy.
 */
module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx) && !strapi.services.post.isStaff(ctx)) {
    const comment = await strapi.query('comment').findOne({id: ctx.params.id});
    if (comment.user.id !== ctx.state.user.id) {
      ctx.forbidden('Can not edit the comment');
      throw new Error('Can not edit the comment');
    }
  }
  await next();
};
