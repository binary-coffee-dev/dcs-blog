'use strict';

module.exports = async (ctx, config, {strapi}) => {
  const id = ctx.request.body.input && ctx.request.body.input.where.id || ctx.request.body.id;
  const post = await strapi.query('api::post.post').findOne({id});
  const currentUser = ctx.state && ctx.state.user || undefined;
  const opinion = await strapi.query('opinion').findOne({post: post.id, user: currentUser.id});
  if (ctx && ctx.state && ctx.state.user && opinion && ctx.state.user.id === opinion.user.id) {
    ctx.request.body = ctx.params = {...ctx.params, id: opinion.id};
    return true;
  }
  return false;
};
