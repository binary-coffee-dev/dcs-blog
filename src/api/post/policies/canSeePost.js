'use strict';

// toDo (gonzalezext)[28.04.23]: middleware

module.exports = async (ctx, config, {strapi}) => {
  const {name} = ctx.args;
  const link = await strapi.query('api::link.link').findOne({where: {name}, populate: ['post']});
  const post = await strapi.query('api::post.post').findOne({where: {id: link.post.id}, populate: ['author']});
  if (post) {
    if (
      strapi.service('api::post.post').isPublish(post) ||
      (post.author && ctx.state && ctx.state.user && post.author.id === ctx.state.user.id) ||
      strapi.service('api::post.post').isAdmin(ctx) ||
      strapi.service('api::post.post').isStaff(ctx)
    ) {
      return true;
    }
  }
  return false;
};
