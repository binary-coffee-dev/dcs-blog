'use strict';

// toDo (gonzalezext)[28.04.23]: middleware

module.exports = async (ctx, config, { strapi }) => {
  ctx.request.body.title = strapi.service('api::post.post').removeExtraSpaces(ctx.request.body.title);
  if (ctx.request.body.title === '') {
    console.log('Empty title is not allowed');
    return false;
  }
  if (strapi.service('api::post.post').isStaff(ctx) || strapi.service('api::post.post').isAdmin(ctx)) {
    return true;
  } else if (strapi.service('api::post.post').isAuthenticated(ctx) && ctx.params.id) {
    const post = await strapi.query('api::post.post').findOne({id: ctx.params.id});
    if (Boolean(post.author) && post.author.id === ctx.state.user.id) {
      delete ctx.request.body.tags;
      delete ctx.request.body.author;
      return true;
    }
  }
  console.log('Wrong permissions');
  return false;
};
