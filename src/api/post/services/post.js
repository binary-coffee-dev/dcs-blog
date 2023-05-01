'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

const {Feed} = require('feed');
const marked = require('marked');

module.exports = createCoreService('api::post.post', ({strapi}) => ({
  async find(ctx, publicOnly, limit, start, where) {
    const sort = (ctx.query.sort || ctx.query._sort);

    const query = this.createQueryObject(ctx, publicOnly, where);
    return await strapi.query('api::post.post').findMany({
      where: {
        ...query,
        _sort: sort,
        _limit: Math.min(limit, strapi.config.custom.maxPostRequestLimit),
        _start: Math.max(start, 0)
      }
    });
  },

  async count(ctx, publicOnly, where) {
    const query = this.createQueryObject(ctx, publicOnly, where);
    return await strapi.query('api::post.post').count({where: query});
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
    const link = await strapi.query('api::link.link').findOne({where: {name}, populate: ['post']});
    const post = await strapi.query('api::post.post').findOne({where: {id: link.post.id}, populate: ['author']});
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
        return strapi.controller('api::post.post').sanitizeOutput(post, ctx);
      }
    }
    return null;
  },

  async findSimilarPosts(id, limit = 10) {
    limit = Math.max(Math.min(limit, strapi.config.custom.maxSimilarPostRequestLimit), 0);

    const post = await strapi.query('api::post.post').findOne({where: {id}, populate: ['tags']});
    const tags = post.tags || [];

    return await strapi.query('api::post.post').findMany({
      where: {
        publishedAt: {$lte: new Date()},
        enable: true,
        id: {$ne: id},
        tags: {id: {$in: tags.map(t => t.id)}},
      },
      orderBy: {views: 'desc'},
      limit
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
    await strapi.query('api::post.post').update({where: {id: post.id}, data: {views}});
  },

  async updateComments(postId) {
    const countOfComments = await strapi.query('api::comment.comment').count({where: {post: postId}});
    await strapi.query('api::post.post').update({where: {id: postId}, data: {comments: countOfComments}});
  },

  async getPublicPostsOfLastDays(days) {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return await strapi.query('api::post.post').findMany({
      where: {
        publishedAt: {$gt: date},
        enable: true
      }
    });
  },

  async getFeed(ctx, format) {
    const feed = this.createFeedInstance();

    const posts = await strapi.query('api::post.post').findMany({
      where: {
        enable: true,
        publishedAt: {$lte: new Date()},
      },
      limit: strapi.config.custom.feedArticlesLimit,
      orderBy: {publishedAt: 'desc'}
    });

    if (posts) {
      posts.forEach(post => feed.addItem(this.createFeedItem(post)));
    }

    const {res, type} = this.generateXmlResponse(feed, format);
    ctx.type = type;
    ctx.send(res);
  },

  async getFeedByUsername(ctx, username, format) {
    const user = await strapi.query('plugin::users-permissions.user').findOne({where: {username}});

    const feed = this.createFeedInstance();

    if (user) {
      const posts = await strapi.query('api::post.post').findMany({
        where: {
          enable: true,
          author: user.id,
          publishedAt: {$lte: new Date()},
        },
        limit: strapi.config.custom.feedArticlesLimit,
        orderBy: {publishedAt: 'desc'}
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
      content: marked.parse(post.body),
      author: [
        {
          name: post.author && post.author.name || 'unknow',
          email: post.author && post.author.email || 'unknow@binary-coffee.dev',
          link: this.getAuthorPage(post.author)
        }
      ],
      date: new Date(post.publishedAt),
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
    return post && post.enable && post.publishedAt && new Date(post.publishedAt).getTime() <= new Date().getTime();
  }
}));