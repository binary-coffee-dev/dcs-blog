'use strict';

/**
 * `canCreateOpinion` policy.
 */

module.exports = async (ctx, next) => {
  const {post, user, type} = ctx.request.body;
  if (ctx && ctx.state && ctx.state.user && ctx.state.user.id === +ctx.request.body.user) {
    const opinions = await strapi.query('opinion').find({user, post, type});
    if (opinions.length === 0 && !!post && !!user && !!type) {
      return await next();
    }
  }
  ctx.forbidden();
  throw new Error();
};
