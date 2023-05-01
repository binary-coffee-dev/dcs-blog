'use strict';

module.exports = async (ctx, config, {strapi}) => {
  const {post, user, type} = ctx.args.data;
  if (ctx && ctx.state && ctx.state.user && ctx.state.user.id === +user) {
    const opinions = await strapi.query('api::opinion.opinion').count({where: {user, post, type}});
    if (opinions === 0 && !!post && !!user && !!type) {
      return true;
    }
  }
  return false;
};
