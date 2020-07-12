'use strict';

const {Feed} = require('feed');

/**
 * Read the documentation () to implement custom service functions
 */

const FEED_ARTICLES_LIMIT = 5;
const MAX_POST_LIMIT = 20;
const MIN_POST_START = 0;
const SORT_ATTR_NAME = 0;
const SORT_ATTR_VALUE = 1;

module.exports = {
  async find(ctx, publicOnly, limit, start, where) {
    let sort = {};
    const sortFromRequest = (ctx.query.sort || ctx.query._sort);
    const sortQuery = sortFromRequest && sortFromRequest.split(':');
    if (sortQuery && sortQuery.length === 2) {
      sort[sortQuery[SORT_ATTR_NAME]] = sortQuery[SORT_ATTR_VALUE].toLowerCase() === 'asc' ? 1 : -1;
    }

    const query = this.createQueryObject(ctx, publicOnly, where);
    return await strapi.models.post.find(query)
      .limit(Math.min(limit, MAX_POST_LIMIT))
      .skip(Math.max(start, MIN_POST_START))
      .sort(sort);
  },

  async count(ctx, publicOnly, where) {
    const query = this.createQueryObject(ctx, publicOnly, where);
    return await strapi.models.post.count(query);
  },

  createQueryObject(ctx, publicOnly, where = {}) {
    if (strapi.services.post.isAuthenticated(ctx) && !publicOnly) {
      return {...where, $or: [{publishedAt: {$lte: new Date()}, enable: true}, {author: ctx.state.user.id}]};
    } else if ((!strapi.services.post.isAdmin(ctx) && !strapi.services.post.isStaff(ctx)) || publicOnly) {
      // public user
      return {...where, publishedAt: {$lte: new Date()}, enable: true};
    }
    return where;
  },

  async findOneByName(ctx, name) {
    const post = await strapi.models.post.findOne({name});
    if (post) {
      if (
        this.isPublish(post) ||
        (post.author && post.author._id.toString() === ctx.state.user.id.toString()) ||
        this.isAdmin(ctx) ||
        this.isStaff(ctx)
      ) {
        await this.updateViews(post);
        return post;
      }
    }
    ctx.forbidden();
    return {};
  },

  async findSimilarPosts(ctx, id, limit) {
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

  getNameFromTitle: (title) => {
    title = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    title = title.replace(/[^0-9a-z-A-Z ]/g, '').replace(/ +/, ' ');
    let result = '', subVal = '';
    for (let i = 0; i < title.length; i++) {
      if (title[i] === ' ') {
        result += (result !== '' && subVal ? '-' : '') + subVal;
        subVal = '';
      } else {
        subVal += title[i];
      }
    }
    return result + (result && subVal !== '' ? '-' : '') + subVal;
  },

  async updateViews(post) {
    const views = `${parseInt(post.views || 0) + 1}`;
    await strapi.models.post.update({name: post.name}, {$set: {views}});
  },

  async updateComments(postId) {
    const countOfComments = await strapi.services.comment.count({post: postId});
    await strapi.services.post.update({id: postId}, {comments: countOfComments});
  },

  async getPublicPostsOfLastDays(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return await strapi.query('post').find({
      publishedAt_gt: date,
      enable_eq: true
    });
  },

  async getFeed(ctx, format) {
    const feed = this.createFeedInstance();

    const posts = await strapi.models.post
      .find({publishedAt: {$lte: new Date()}, enable: true})
      .sort({publishedAt: 'desc'})
      .limit(FEED_ARTICLES_LIMIT);

    if (posts) {
      posts.forEach(post => feed.addItem(this.createFeedItem(post)));
    }

    const {res, type} = this.generateXmlResponse(feed, format);
    ctx.type = type;
    ctx.send(res);
  },

  async getFeedByUsername(ctx, username, format) {
    const user = await strapi.plugins['users-permissions'].models.user.findOne({username});

    const feed = this.createFeedInstance();

    if (user) {
      const posts = await strapi.models.post
        .find({author: user.id, publishedAt: {$lte: new Date()}, enable: true})
        .sort({publishedAt: 'desc'})
        .limit(FEED_ARTICLES_LIMIT);

      if (posts) {
        posts.forEach(post => feed.addItem(this.createFeedItem(post)));
      }
    }

    const {res, type} = this.generateXmlResponse(feed, format);
    ctx.type = type;
    ctx.send(res);
  },

  createFeedItem(post) {
    const apiUrl = strapi.config.custom.apiUrl;
    const siteUrl = strapi.config.custom.siteUrl;
    return {
      title: post.title,
      id: `${siteUrl}/post/${post.name}`,
      link: `${siteUrl}/post/${post.name}`,
      description: post.description,
      author: [
        {
          name: post.author && post.author.name || 'unknow',
          email: post.author && post.author.email || 'unknow@binary-coffee.dev',
          link: post.author && post.author.page || 'https://aa'
        }
      ],
      date: post.publishedAt,
      image: post.banner ? `${apiUrl}${post.banner.url}` : undefined
    };
  },

  createFeedInstance() {
    const siteUrl = strapi.config.custom.siteUrl;
    return new Feed({
      title: 'Binary Coffee',
      description: 'Last published articles',
      id: siteUrl,
      link: siteUrl,
      language: 'es',
      copyright: 'All rights reserved 2019, dcs-community',
    });
  },

  generateXmlResponse(feed, format) {
    switch (format) {
      case 'atom1':
        return {type: 'application/atom+xml; charset=utf-8', res: feed.atom1()};
      case 'rss2':
        return {type: 'application/rss+xml; charset=utf-8', res: feed.rss2()};
      case 'json1':
      default:
        return {type: 'application/json; charset=utf-8', res: feed.json1()};
    }
  },

  isStaff: (ctx) => {
    return ctx && ctx.state && ctx.state.user && ctx.state.user.role && ctx.state.user.role.type === 'staff';
  },

  isAuthenticated: (ctx) => {
    return ctx && ctx.state && ctx.state.user && ctx.state.user.role && ctx.state.user.role.type === 'authenticated';
  },

  isAdmin: (ctx) => {
    return ctx && ctx.state && ctx.state.user && ctx.state.user.role && ctx.state.user.role.type === 'administrator';
  },

  isPublish(post) {
    return post && post.enable && post.publishedAt && post.publishedAt.getTime() <= new Date().getTime();
  }
};
