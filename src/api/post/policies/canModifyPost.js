'use strict';

// toDo (gonzalezext)[28.04.23]: middleware

module.exports = async (ctx, config, { strapi }) => {
  ctx.args.data.title = strapi.service('api::post.post').removeExtraSpaces(ctx.args.data.title);
  if (ctx.args.data.title === '') {
    console.log('Empty title is not allowed');
    return false;
  }
  if (strapi.service('api::post.post').isStaff(ctx) || strapi.service('api::post.post').isAdmin(ctx)) {
    return true;
  } else if (strapi.service('api::post.post').isAuthenticated(ctx) && ctx.args.id) {
    const post = await strapi.query('api::post.post').findOne({where: {id: ctx.args.id}, populate: ['author']});
    if (Boolean(post.author) && post.author.id === ctx.state.user.id) {
      delete ctx.args.data.tags;
      delete ctx.args.data.author;
      return true;
    }
  }
  console.log('Wrong permissions');
  return false;
};
