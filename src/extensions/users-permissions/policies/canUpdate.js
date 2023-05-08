'use strict';

module.exports = async (ctx, config, {strapi}) => {
  if (strapi.service('api::post.post').isAdmin(ctx)) {
    return true;
  }
  if (ctx && ctx.state && ctx.state.user) {
    const {id} = ctx.args || ctx.params;
    if (+id === +ctx.state.user.id) {
      return true;
    }
  }
  console.log('Can not update user');
  return false;
};
