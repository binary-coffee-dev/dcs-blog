'use strict';

const {createCoreController} = require('@strapi/strapi').factories;

const moment = require('moment-timezone');
moment.locale('es_ES');

module.exports = createCoreController('api::comment.comment', ({strapi}) => ({
  async create(ctx) {
    if (ctx.request.body.body && ctx.request.body.post && ctx.state.user.id) {
      const comment = await strapi.service('api::comment.comment').create(ctx.request.body.body, ctx.request.body.post, ctx.state.user.id);
      return this.sanitizeOutput(comment, ctx);
    }
    return new Error('invalid-data');
  },

  async update(ctx) {
    if (ctx.request.body.body && ctx.params.id) {
      const comment = await strapi.service('api::comment.comment').update(ctx.params.id, ctx.request.body.body);
      return this.sanitizeOutput(comment, ctx);
    }
    throw new Error('invalid data');
  },

  async recentComments(ctx) {
    let limit = ctx.params._limit || ctx.params.limit;

    const comments = await strapi.service('api::comment.comment').recentComments(limit);

    ctx.send(this.sanitizeOutput(comments, ctx));
  }
}));
