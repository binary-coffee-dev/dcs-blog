'use strict';

module.exports = async (ctx, config, {strapi}) => {
  const {id} = ctx.args;
  const opinion = await strapi.query('api::opinion.opinion').findOne({where: {id}, populate: ['user']});
  return !!(ctx && ctx.state && ctx.state.user && opinion && +ctx.state.user.id === +opinion.user.id);
};
