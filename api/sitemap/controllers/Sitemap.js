'use strict';

const Parser = require('fast-xml-parser').j2xParser;

module.exports = {
  async sitemap (ctx) {
    const apiUrl = process.env.API_URL || 'https://binary-coffee.dev';
    const parser = new Parser({ignoreAttributes: false});

    const mapsite = {
      urlset: {
        '@_xmlns': 'http://www.sitemaps.org/schemas/sitemap/0.9',
        url: [{
          loc: apiUrl,
          changefreq: 'daily',
          priority: 0.4
        }]
      }
    };

    const posts = await strapi.controllers.post.find();

    posts.forEach(post => mapsite.urlset.url.push({
      loc: `${apiUrl}/post/${post.name}`,
      lastmod: post.publishedAt.toISOString(),
      changefreq: 'monthly',
      priority: 0.5
    }));

    const xml = parser.parse(mapsite);
    ctx.type = 'xml';
    ctx.send(`<?xml version="1.0" encoding="UTF-8"?>\n${xml}`);
  }
};
