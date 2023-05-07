'use strict';

module.exports = async (ctx, config, {strapi}) => {
  const {id} = ctx.args;
  if (!(ctx && ctx.state && ctx.state.user)) {
    return false;
  }
  const opinion = await strapi.query('api::opinion.opinion')
    .findOne({where: {post: id, user: ctx.state.user.id}, populate: ['user']});
  if (opinion) {
    ctx.args.id = opinion.id;
  }
  return Boolean(opinion);
};
