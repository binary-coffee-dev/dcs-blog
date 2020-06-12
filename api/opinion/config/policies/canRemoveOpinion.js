'use strict';

/**
 * `canRemoveOpinion` policy.
 */

module.exports = async (ctx, next) => {
  // const id = ctx.request.body.input && ctx.request.body.input.where.id || ctx.request.body.id;
  // const opinion = await strapi.models.opinion.findOne({_id: id});
  // if (ctx && ctx.state && ctx.state.user && opinion && ctx.state.user.id === opinion.user._id.toString()) {
  return await next();
  // }
  // ctx.request.body = ctx.params = {};
  // ctx.unauthorized();
};
