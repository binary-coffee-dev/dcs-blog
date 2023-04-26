'use strict';

const {sanitizeEntity} = require('strapi-utils');
const moment = require('moment-timezone');
moment.locale('es_ES');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
module.exports = {
  async create(ctx) {
    if (ctx.request.body.body && ctx.request.body.post && ctx.state.user.id) {
      const comment = await strapi.services.comment.create(ctx.request.body.body, ctx.request.body.post, ctx.state.user.id);
      return sanitizeEntity(comment, {model: strapi.models.comment});
    }
    return new Error('invalid-data');
  },

  async update(ctx) {
    if (ctx.request.body.body && ctx.params.id) {
      const comment = await strapi.services.comment.update(ctx.params.id, ctx.request.body.body);
      return sanitizeEntity(comment, {model: strapi.models.comment});
    }
    throw new Error('invalid data');
  },

  async recentComments(ctx) {
    let limit = ctx.params._limit || ctx.params.limit;

    const comments = await strapi.services.comment.recentComments(limit);

    ctx.send(sanitizeEntity(comments, {model: strapi.models.comment}));
  }
};
