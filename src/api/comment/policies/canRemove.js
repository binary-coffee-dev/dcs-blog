'use strict';

module.exports = async (ctx, config, { strapi }) => {
  if (!strapi.service('api::post.post').isAdmin(ctx) && !strapi.service('api::post.post').isStaff(ctx)) {
    const comment = await strapi.query('comment').findOne({id: ctx.params.id});
    if (+comment.user.id !== +ctx.state.user.id) {
      console.log('Can not remove the comment');
      return false;
    }
  }
  return true;
};
