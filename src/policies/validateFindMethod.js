'use strict';

module.exports = async (ctx, config, {strapi}) => {
  const {filters = {}, pagination, sort, publicationState} = ctx.args;
  if (publicationState === 'preview') {
    if (ctx.state.user === undefined) {
      filters.publishedAt = {lte: new Date()};
    } else if (ctx.state.user.role.type === 'authenticated') {
      filters.author = {id: {eq: ctx.state.user.id}};
    }
  } else {
    filters.enable = {eq: true};
  }
  return true;
};
