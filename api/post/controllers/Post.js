'use strict';

const {buildQuery, convertRestQueryParams} = require('strapi-utils');

const {Feed} = require('feed');

/**
 * Read the documentation () to implement custom controller functions
 */

function isWriter(ctx) {
  return ctx && ctx.state && ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'writer';
}

module.exports = {
  async find(ctx = {}, next, extra = {}) {
    if (!isWriter(ctx)) {
      ctx.query = {
        ...(ctx.query || {}),
        publishedAt_lte: new Date().toISOString(),
        enable: true
      };
    }

    const filters = convertRestQueryParams(ctx.query);
    return buildQuery({
      model: Post,
      filters,
      populate: extra.populate || ''
    });
  },

  count(ctx) {
    if (!isWriter(ctx)) {
      ctx.query = {
        ...ctx.query,
        publishedAt_lte: new Date().toISOString(),
        enable: true
      };
    }

    return strapi.services.post.count(ctx.query);
  },

  async findOneByName(ctx, next, extra = {}) {
    const name = ctx.params.name || ctx.params._name || '';
    const params = {name};
    const filters = convertRestQueryParams(params);
    return buildQuery({
      model: Post,
      filters,
      populate: extra.populate || ''
    }).then(async (posts) => {
      if (posts && posts.length > 0) {
        const post = posts[0];
        post.views = `${parseInt(post.views || 0) + 1}`;
        await Post.update({name}, {$set: {views: post.views}});
        return post;
      }
      return null;
    });
  },

  async feed(ctx) {
    const format = ctx.params.format || ctx.params._format || '';
    const params = {
      enable: true,
      publishedAt_lte: new Date(),
      _sort: 'publishedAt:desc',
      _limit: 5,
      _start: 0
    };
    return buildQuery({
      model: Post,
      filters: convertRestQueryParams(params),
      populate: ['author', 'banner']
    }).then(async (posts) => {
      const apiUrl = strapi.config.apiUrl || 'https://api.binary-coffee.dev';
      const siteUrl = strapi.config.siteUrl || 'https://binary-coffee.dev';
      const feed = new Feed({
        title: 'Binary Coffee',
        description: 'Last published articles',
        id: siteUrl,
        link: siteUrl,
        language: 'es',
        copyright: 'All rights reserved 2019, dcs-community',
      });
      if (posts && posts.length > 0) {
        posts.forEach(post => {
          feed.addItem({
            title: post.title,
            id: `${siteUrl}/post/${post.name}`,
            link: `${siteUrl}/post/${post.name}`,
            description: post.description,
            author: [
              {
                name: post.author && post.author.name || 'unknow',
                email: post.author && post.author.email || 'unknow@gmail.com',
                link: post.author && post.author.page || 'https://unknow.com'
              }
            ],
            date: post.publishedAt,
            image: post.banner ? `${apiUrl}${post.banner.url}` : undefined
          });
        });
      }
      switch (format) {
        case 'rss2':
          ctx.type = 'application/rss+xml; charset=utf-8';
          return ctx.send(feed.rss2());
        case 'json1':
          ctx.type = 'application/json; charset=utf-8';
          return ctx.send(feed.json1());
        case 'atom1':
        default:
          ctx.type = 'application/atom+xml; charset=utf-8';
          return ctx.send(feed.atom1());
      }
    });
  }
};
