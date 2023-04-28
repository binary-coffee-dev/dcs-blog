'use strict';

/**
 * `canRemoveFile` policy.
 */
module.exports = async (ctx, next) => {
  if (strapi.services.post.isAdmin(ctx)) {
    return await next();
  }
  if (ctx.state.user) {
    const uploadFile = await strapi.query('file', 'upload').findOne({id: ctx.params.id});
    if (uploadFile && uploadFile.related.length && uploadFile.related[0].user === ctx.state.user.id) {
      return await next();
    }
  }
  ctx.forbidden('Can not remove file');
  throw new Error('Can not remove file');
};
