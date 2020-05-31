'use strict';

const {buildQuery, convertRestQueryParams} = require('strapi-utils');

const {Feed} = require('feed');

/**
 * Read the documentation () to implement custom controller functions
 */

const MAX_POST_LIMIT = 20;
const MIN_POST_START = 0;
const SORT_ATTR_NAME = 0;
const SORT_ATTR_VALUE = 1;

module.exports = {
  async find(ctx = {}) {
    let query = {};

    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;

    let sort = {};
    const sortFromRequest = (ctx.query.sort || ctx.query._sort);
    const sortQuery = sortFromRequest && sortFromRequest.split(':');
    if (sortQuery && sortQuery.length === 2) {
      sort[sortQuery[SORT_ATTR_NAME]] = sortQuery[SORT_ATTR_VALUE].toLowerCase() === 'asc' ? 1 : -1;
    }

    if (strapi.services.post.isAuthenticated(ctx) && !publicOnly) {
      query = {$or: [{publishedAt: {$lte: new Date()}, enable: true}, {author: ctx.state.user.id}]};
    } else if (!strapi.services.post.isStaff(ctx) || publicOnly) {
      // public user
      query = {publishedAt: {$lte: new Date()}, enable: true};
    }
    return await strapi.models.post.find(query)
      .limit(Math.min(ctx.query.limit || ctx.query._limit || MAX_POST_LIMIT, MAX_POST_LIMIT))
      .skip(Math.max(ctx.query.start || ctx.query._start || MIN_POST_START, MIN_POST_START))
      .sort(sort);
  },

  async count(ctx) {
    let query = {};

    const publicOnly = (ctx.params._where && ctx.params._where.enable) ||
      (ctx.params.where && ctx.params.where.enable) || false;

    if (strapi.services.post.isAuthenticated(ctx) && !publicOnly) {
      query = {$or: [{publishedAt: {$lte: new Date()}, enable: true}, {author: ctx.state.user.id}]};
    } else if (!strapi.services.post.isStaff(ctx) || publicOnly) {
      // public user
      query = {publishedAt: {$lte: new Date()}, enable: true};
    }
    return await strapi.models.post.count(query);
  },

  async findOneByName(ctx, next, extra = {}) {
    const name = ctx.params.name || ctx.params._name || '';
    const params = {name};
    const filters = convertRestQueryParams(params);
    return buildQuery({
      model: strapi.models.post,
      filters,
      populate: extra.populate || ''
    }).then(async (posts) => {
      let ret = null;
      if (posts && posts.length > 0) {
        const post = posts[0];
        const isPublished = Boolean(post.publishedAt && post.publishedAt.getTime() < new Date().getTime());
        const isEnable = !!post.enable;
        if (strapi.services.post.isAuthenticated(ctx) &&
          ((isPublished && isEnable) || (post.author && post.author._id.toString() === ctx.state.user.id.toString()))
        ) {
          ret = post;
        } else if (strapi.services.post.isStaff(ctx)) {
          ret = post;
        } else if (isPublished && isEnable) {
          // public user
          ret = post;
        }
      }
      if (!ret) {
        ctx.status = 403;
        return {};
      }
      await strapi.services.post.updateViews(ret);
      return ret;
    });
  },

  async findSimilarPosts(ctx) {
    let {id, limit = 10} = ctx.params;
    limit = Math.max(Math.min(limit, 20), 0);

    let postToReturn = [];
    const post = await strapi.models.post.findOne({_id: id}).populate(['tags']);
    const tags = post.tags || [];
    const markTags = new Set();

    tags.forEach(tag => markTags.add(tag.id));

    const posts = (await strapi.models.post
      .find({publishedAt: {$lte: new Date()}, enable: true, _id: {$ne: id}})
      .sort({views: 'desc'})
      .populate(['tags'])) || [];

    posts
      .filter(post => (post.tags || []).reduce((p, v) => p || markTags.has(v.id), false))
      .forEach(post => {
        postToReturn.push(post);
      });

    if (postToReturn.length > limit) {
      postToReturn = postToReturn.slice(0, limit);
    }

    ctx.send(postToReturn);
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
      model: strapi.models.post,
      filters: convertRestQueryParams(params),
      populate: ['author', 'banner']
    }).then(async (posts) => {
      const apiUrl = strapi.config.apiUrl;
      const siteUrl = strapi.config.siteUrl;
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
