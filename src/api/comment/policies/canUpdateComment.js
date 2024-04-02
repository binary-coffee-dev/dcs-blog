'use strict';

module.exports = async (ctx, config, {strapi}) => {
  if (!strapi.service('api::post.post').isAdmin(ctx) && !strapi.service('api::post.post').isStaff(ctx)) {
    const comment = await strapi.query('api::comment.comment').findOne({where: {id: ctx.args.id}, populate: ['user']});
    if (comment.user.id !== ctx.state.user.id) {
      console.log('Can not edit the comment');
      return false;
    }
  }
  return true;
};
