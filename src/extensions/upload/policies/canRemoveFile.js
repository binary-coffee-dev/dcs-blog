'use strict';

module.exports = async (ctx, config, {strapi}) => {
  if (strapi.service('api::post.post').isAdmin(ctx)) {
    return true;
  }
  if (ctx && ctx.state && ctx.state.user) {
    const {id} = ctx.args || ctx.params;
    const uploadFile = await strapi.query('plugin::upload.file').findOne({
      where: {id},
      populate: ['related']
    });
    if (uploadFile && uploadFile.related && uploadFile.related.length && uploadFile.related[0].__type === 'api::image.image') {
      const image = await strapi.query('api::image.image').findOne({
        where: {id: uploadFile.related[0].id},
        populate: ['user']
      });
      if (image && image.user && +image.user.id === +ctx.state.user.id) {
        return true;
      }
    }
  }
  console.log('Can not remove file');
  return false;
};
