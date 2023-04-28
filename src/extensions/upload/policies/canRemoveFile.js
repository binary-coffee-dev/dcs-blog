'use strict';

module.exports = async (ctx, config, { strapi }) => {
  if (strapi.service('api::post.post').isAdmin(ctx)) {
    return true;
  }
  if (ctx.state.user) {
    const uploadFile = await strapi.query('file', 'upload').findOne({id: ctx.params.id});
    if (uploadFile && uploadFile.related.length && uploadFile.related[0].user === ctx.state.user.id) {
      return true;
    }
  }
  console.log('Can not remove file');
  return false;
};
