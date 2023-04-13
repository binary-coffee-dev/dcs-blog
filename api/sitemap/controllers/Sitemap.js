'use strict';

const Parser = require('fast-xml-parser').j2xParser;

module.exports = {
  async sitemap (ctx) {
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

    // const sort = {'publishedAt': -1};
    // const query = {publishedAt: {$lte: new Date()}, enable: true};
    const res = await strapi.query('post').model.query(qb => {
      qb.orderBy('publishedAt', 'ASC');
      qb.whereRaw('publishedAt < ? AND enable = 1', [new Date().toISOString().slice(0, 19).replace('T', ' ')]);
    }).fetchAll();
    const posts = res.models;

    posts.forEach(post => mapsite.urlset.url.push({
      loc: `${siteUrl}/post/${post.get('name')}`,
      lastmod: new Date(post.get('publishedAt')).toISOString(),
      changefreq: 'monthly',
      priority: 0.5
    }));

    const xml = parser.parse(mapsite);
    ctx.type = 'xml';
    ctx.send(`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`);
  }
};
