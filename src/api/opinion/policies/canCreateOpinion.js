'use strict';

module.exports = async (ctx, config, {strapi}) => {
  const {post, user, type} = ctx.request.body;
  if (ctx && ctx.state && ctx.state.user && ctx.state.user.id === +ctx.request.body.user) {
    const opinions = await strapi.query('opinion').find({user, post, type});
    if (opinions.length === 0 && !!post && !!user && !!type) {
      return true;
    }
  }
  return false;
};
