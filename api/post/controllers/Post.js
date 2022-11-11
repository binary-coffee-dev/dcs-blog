'use strict';

const { sanitizeEntity } = require('strapi-utils');

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  async find(ctx) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;
    const where = ctx.params._where || ctx.params.where || {};
    const limit = parseInt(ctx.query.limit || ctx.query._limit || Number.MAX_SAFE_INTEGER);
    const start = parseInt(ctx.query.start || ctx.query._start || Number.MIN_SAFE_INTEGER);

    const articles = await strapi.services.post.find(ctx, publicOnly, limit, start, where);
    return articles.map(article => sanitizeEntity(article, {model: strapi.models.post}));
  },

  async count(ctx) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;
    const where = ctx.params._where || ctx.params.where || {};

    return strapi.services.post.count(ctx, publicOnly, where);
  },

  async findOneByName(ctx) {
    const name = ctx.params.name || ctx.params._name || '';
    const noUpdate = ctx.params.noUpdate || ctx.params._noUpdate || false;
    const article = await strapi.services.post.findOneByName(ctx, name, noUpdate);
    return sanitizeEntity(article, {model: strapi.models.post});
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
  },

  async getPostBodyByName(ctx) {
    const name = ctx.params.name || ctx.params._name || '';
    const article = await strapi.services.post.findOneByName(ctx, name);
    ctx.type = 'text/markdown; charset=UTF-8';
    ctx.body = article.body;
    return ctx.body;
  }
};
