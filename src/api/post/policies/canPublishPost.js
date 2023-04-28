'use strict';

// toDo (gonzalezext)[28.04.23]: middleware

module.exports = async (ctx, config, { strapi }) => {
  if (!strapi.service('').isAdmin(ctx)) {
    ctx.request.body.published_at = null;
  }
  return true;
};
