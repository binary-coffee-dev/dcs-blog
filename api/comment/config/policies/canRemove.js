'use strict';

/**
 * `canRemove` policy.
 */
module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx) && !strapi.services.post.isStaff(ctx)) {
    const comment = await strapi.query('comment').findOne({id: ctx.params.id});
    if (+comment.user.id !== +ctx.state.user.id) {
      ctx.forbidden('Can not remove the comment');
      throw new Error('Can not remove the comment');
    }
  }
  await next();
};
