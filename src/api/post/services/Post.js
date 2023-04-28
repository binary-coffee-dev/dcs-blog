'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

const {Feed} = require('feed');
const marked = require('marked');

module.exports = createCoreService('api::post.post', ({strapi}) => ({
  async find(ctx, publicOnly, limit, start, where) {
    const sort = (ctx.query.sort || ctx.query._sort);

    const query = this.createQueryObject(ctx, publicOnly, where);
    return await strapi.query('api::post.post').find({
      ...query,
      _sort: sort,
      _limit: Math.min(limit, strapi.config.custom.maxPostRequestLimit),
      _start: Math.max(start, 0)
    });
  },

  async count(ctx, publicOnly, where) {
    const query = this.createQueryObject(ctx, publicOnly, where);
    return await strapi.query('api::post.post').count(query);
  },

  createQueryObject(ctx, publicOnly, where = {}) {
    where = this.cleanWhere(where);
    where = this.convertToLikeQuery(where);
    if (strapi.service('api::post.post').isAuthenticated(ctx) && !publicOnly) {
      return {...where, _or: [{published_at_lte: new Date(), enable: true}, {author: ctx.state.user.id}]};
    } else if ((!strapi.service('api::post.post').isAdmin(ctx) && !strapi.service('api::post.post').isStaff(ctx)) || publicOnly) {
      // public user
      return {...where, published_at_lte: new Date(), enable: true};
    }
    return where;
  },

  /**
   * Modify the matched keys and add the suffix *_like* at the end.
   * @param where any
   * @param attributes string[]
   */
  convertToLikeQuery(where = {}, attributes = ['title']) {
    const mark = new Set();
    attributes.forEach(attr => mark.add(attr));
    return Object.keys(where).reduce((p, k) => {
      if (mark.has(k)) {
        p[k + '_contains'] = where[k];
      } else {
        p[k] = where[k];
      }
      return p;
    }, {});
  },

  /**
   * This method remove all the queries that are different from the defined in the **allowedAttributes** array.
   * @param allowedAttributes string[]
   * @param where any
   */
  cleanWhere(where = {}, allowedAttributes = ['title', 'author']) {
    const mark = new Set();
    allowedAttributes.forEach(attr => mark.add(attr));
    return Object.keys(where).reduce((prev, value) => {
      if (mark.has(value)) {
        prev[value] = where[value];
      }
      return prev;
    }, {});
  },

  async findOneByName(ctx, name, noUpdate) {
    const link = await strapi.query('api::link.link').findOne({name});
    const post = await strapi.query('api::post.post').findOne({id: link.post.id});
    if (post) {
      if (
        this.isPublish(post) ||
        (post.author && post.author.id === ctx.state.user.id) ||
        this.isAdmin(ctx) ||
        this.isStaff(ctx)
      ) {
        if (!noUpdate) {
          await this.updateViews(post);
        }
        return post;
      }
    }
    ctx.forbidden();
    return {};
  },

  async findSimilarPosts(ctx, id, limit = 10) {
    limit = Math.max(Math.min(limit, strapi.config.custom.maxSimilarPostRequestLimit), 0);

    const post = await strapi.query('api::post.post').findOne({id});
    const tags = post.tags || [];

    return await strapi.query('api::post.post').find({
      published_at_lte: new Date(),
      enable: true,
      id_ne: id,
      tags_in: tags.map(t => t.id),
      _sort: 'views:DESC',
      _limit: limit
    });
  },

  removeExtraSpaces(text) {
    return text.replace(/ +/g, ' ').trim();
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
    const randomTail = [...Array(5).keys()]
      .map(() => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 'abcdefghijklmnopqrstuvwxyz'.length)])
      .reduce((p, v) => p + v, '');
    return result + (result && subVal !== '' ? '-' : '') + subVal + randomTail;
  },

  async updateViews(post) {
    const views = `${parseInt(post.views || 0) + 1}`;
    await strapi.query('api::post.post').update({id: post.id}, {views});
  },

  async updateComments(postId) {
    const countOfComments = await strapi.query('comment').count({post: postId});
    await strapi.query('api::post.post').update({id: postId}, {comments: countOfComments});
  },

  async getPublicPostsOfLastDays(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return await strapi.query('api::post.post').find({
      published_at_gt: date,
      enable_eq: true
    });
  },

  async getFeed(ctx, format) {
    const feed = this.createFeedInstance();

    const posts = await strapi.query('api::post.post').find({
      enable_eq: true,
      published_at_lte: new Date(),
      _limit: strapi.config.custom.feedArticlesLimit,
      _sort: 'published_at:DESC'
    });

    if (posts) {
      posts.forEach(post => feed.addItem(this.createFeedItem(post)));
    }

    const {res, type} = this.generateXmlResponse(feed, format);
    ctx.type = type;
    ctx.send(res);
  },

  async getFeedByUsername(ctx, username, format) {
    const user = await strapi.query('plugin::users-permissions.user').findOne({username});

    const feed = this.createFeedInstance();

    if (user) {
      const posts = await strapi.query('api::post.post').find({
        enable_eq: true,
        author_eq: user.id,
        published_at_lte: new Date(),
        _limit: strapi.config.custom.feedArticlesLimit,
        _sort: 'published_at:DESC'
      });

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
      content: marked(post.body),
      author: [
        {
          name: post.author && post.author.name || 'unknow',
          email: post.author && post.author.email || 'unknow@binary-coffee.dev',
          link: this.getAuthorPage(post.author)
        }
      ],
      date: new Date(post.published_at),
      image: post.banner ? `${apiUrl}${post.banner.url}` : undefined
    };
  },

  calculateReadingTime(text) {
    const wordsPerMinute = 200;
    const noOfWords = text.split(/\s/g).length;
    const minutes = noOfWords / wordsPerMinute * 60;
    return Math.ceil(minutes);
  },

  getAuthorPage(author) {
    const siteUrl = strapi.config.custom.siteUrl;
    if (author && author.username) {
      return `${siteUrl}/users/${author.username}`;
    }
    return 'https://aa';
  },

  createFeedInstance() {
    const siteUrl = strapi.config.custom.siteUrl;
    return new Feed({
      title: 'Binary Coffee',
      description: 'Last published articles',
      id: siteUrl,
      link: siteUrl,
      language: 'es',
      image: `${strapi.config.custom.apiUrl}/favicon32x32.png`,
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
    return (ctx.state.user && ctx.state.user.role && ctx.state.user.role.type === 'administrator') ||
      (ctx.state.user && ctx.state.user.roles && ctx.state.user.roles[0].code === 'strapi-super-admin');
  },

  isPublish(post) {
    return post && post.enable && post.published_at && new Date(post.published_at).getTime() <= new Date().getTime();
  }
}));
