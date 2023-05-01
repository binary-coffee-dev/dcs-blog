'use strict';

const {createCoreController} = require('@strapi/strapi').factories;

const {j2xParser: Parser} = require('fast-xml-parser');

module.exports = createCoreController('api::post.post', ({strapi}) => ({
  async find(ctx) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;
    const where = ctx.params._where || ctx.params.where || {};
    const limit = parseInt(ctx.query.limit || ctx.query._limit || Number.MAX_SAFE_INTEGER);
    const start = parseInt(ctx.query.start || ctx.query._start || Number.MIN_SAFE_INTEGER);

    const articles = await strapi.service('api::post.post').find(ctx, publicOnly, limit, start, where);
    return articles.map(article => this.sanitizeOutput(article, ctx));
  },

  async count(ctx) {
    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;
    const where = ctx.params._where || ctx.params.where || {};

    return await strapi.service('api::post.post').count(ctx, publicOnly, where);
  },

  async findOneByName(ctx) {
    const name = ctx.params.name || ctx.params._name || '';
    const noUpdate = ctx.params.noUpdate || ctx.params._noUpdate || false;
    const article = await strapi.service('api::post.post').findOneByName(ctx, name, noUpdate);
    return this.sanitizeOutput(article, ctx);
  },

  async findSimilarPosts(ctx) {
    const id = ctx.params.id;
    const limit = (ctx.params.limit || ctx.params._limit);
    const articles = await strapi.service('api::post.post').findSimilarPosts(id, limit);
    return articles.map(article => this.sanitizeOutput(article, ctx));
  },

  async feedByUsername(ctx) {
    const {format, username} = ctx.params;
    return strapi.service('api::post.post').getFeedByUsername(ctx, username, format);
  },

  async feed(ctx) {
    const {format} = ctx.params;
    return strapi.service('api::post.post').getFeed(ctx, format);
  },

  async getPostBodyByName(ctx) {
    const name = ctx.params.name || ctx.params._name || '';
    const article = await strapi.service('api::post.post').findOneByName(ctx, name);
    ctx.type = 'text/markdown; charset=UTF-8';
    ctx.body = article.body;
    return ctx.body;
  },

  async sitemap(ctx) {
    const siteUrl = strapi.config.custom.siteUrl;
    const parser = new Parser({ignoreAttributes: false});

    const mapsite = {
      urlset: {
        '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        url: [{
          loc: siteUrl,
          changefreq: 'daily',
          priority: 0.4
        }]
      }
    };

    const posts = await strapi.query('api::post.post').findMany({
      where: {
        enable: true,
        publishedAt: {$lte: new Date()},
      },
      orderBy: {publishedAt: 'asc'}
    });

    posts.forEach(post => mapsite.urlset.url.push({
      loc: `${siteUrl}/post/${post['name']}`,
      lastmod: new Date(post['publishedAt']).toISOString(),
      changefreq: 'monthly',
      priority: 0.5
    }));

    const xml = parser.parse(mapsite);
    ctx.type = 'xml';
    ctx.send(`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`);
  }
}));
