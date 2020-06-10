'use strict';

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  async find(ctx) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;
    const limit = parseInt(ctx.query.limit || ctx.query._limit || Number.MAX_SAFE_INTEGER);
    const start = parseInt(ctx.query.start || ctx.query._start || Number.MIN_SAFE_INTEGER);

    return strapi.services.post.find(ctx, publicOnly, limit, start);
  },

  async count(ctx) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;

    return strapi.services.post.count(ctx, publicOnly);
  },

  async findOneByName(ctx) {
    const name = ctx.params.name || ctx.params._name || '';
    return strapi.services.post.findOneByName(ctx, name);
  },

  async findSimilarPosts(ctx) {
    let {id, limit = 10} = ctx.params;
    return strapi.services.post.findSimilarPosts(ctx, id, limit);
  },

  async feedByUsername(ctx) {
    const {format, username} = ctx.params;
    return strapi.services.post.getFeedByUsername(ctx, username, format);
  },

  async feed(ctx) {
    const {format} = ctx.params;
    return strapi.services.post.getFeed(ctx, format);
  }
};
