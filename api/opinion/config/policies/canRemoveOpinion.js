'use strict';

/**
 * `canRemoveOpinion` policy.
 */

module.exports = async (ctx, next) => {
  const id = ctx.request.body.input && ctx.request.body.input.where.id || ctx.request.body.id;
  const post = await strapi.query('post').findOne({id});
  const currentUser = ctx.state && ctx.state.user || undefined;
  const opinion = await strapi.query('opinion').findOne({post: post.id, user: currentUser.id});
  if (ctx && ctx.state && ctx.state.user && opinion && ctx.state.user.id === opinion.user.id) {
    ctx.request.body = ctx.params = {...ctx.params, id: opinion.id};
    return await next();
  }
  ctx.unauthorized();
  throw new Error();
};
