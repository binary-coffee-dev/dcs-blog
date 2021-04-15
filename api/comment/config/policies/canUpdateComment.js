'use strict';

/**
 * `canUpdateComment` policy.
 */
module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx) && !strapi.services.post.isStaff(ctx)) {
    const comment = await strapi.models.comment.findOne({_id: ctx.params.id}).populate('user');
    if (comment.user.id.toString() !== ctx.state.user.id.toString()) {
      ctx.forbidden('Can not edit the comment');
      throw new Error('Can not edit the comment');
    }
  }
  await next();
};
