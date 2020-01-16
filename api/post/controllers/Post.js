'use strict';

const {sanitizeEntity, buildQuery, convertRestQueryParams} = require('strapi-utils');

const {Feed} = require('feed');

/**
 * Read the documentation () to implement custom controller functions
 */

function isWriter(ctx) {
  return ctx && ctx.state && ctx.state.user && ctx.state.user.role && ctx.state.user.role.name === 'writer';
}

function isPublished(entity) {
  return entity && entity.publishedAt && entity.publishedAt.getTime() <= new Date().getTime();
}

module.exports = {
  async find(ctx) {
    let entities;

    if (ctx.query._q) {
      entities = await strapi.services.post.search(ctx.query);
    } else {
      entities = await strapi.services.post.find(ctx.query);
    }

    return entities.reduce((prev, entity) => {
      if (entity.enable && isPublished(entity) || isWriter(ctx)) {
        prev.push(sanitizeEntity(entity, {model: strapi.models.post}));
      }
      return prev;
    }, []);
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

  async feed(ctx, next) {
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
      const feed = new Feed({
        title: "Binary Coffee",
        description: "Last published articles",
        id: "https://binary-coffee.dev/",
        link: "https://binary-coffee.dev",
        language: "es",
        copyright: "All rights reserved 2019, dcs-community",
      });
      if (posts && posts.length > 0) {
        posts.forEach(post => {
          feed.addItem({
            title: post.title,
            id: `https://binary-coffee.dev/post/${post.name}`,
            link: `https://binary-coffee.dev/post/${post.name}`,
            description: post.description,
            author: [
              {
                name: post.author && post.author.name || 'unknow',
                email: post.author && post.author.email || 'unknow@gmail.com',
                link: post.author && post.author.page || 'https://unknow.com'
              }
            ],
            date: post.publishedAt,
            image: post.banner ? `https://api.binary-coffee.dev${post.banner.url}` : undefined
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
