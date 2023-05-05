'use strict';

// toDo (gonzalezext)[28.04.23]: middleware

module.exports = async (ctx, config, { strapi }) => {
  if (!strapi.service('api::post.post').isAdmin(ctx)) {
    ctx.args.data.publishedAt = null;
  }
  return true;
};
