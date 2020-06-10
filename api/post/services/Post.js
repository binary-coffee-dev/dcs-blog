'use strict';

const {Feed} = require('feed');

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {
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
    var date = new Date();
    date.setDate(date.getDate() - days);
    return await strapi.query('post').find({
      publishedAt_gt: date,
      enable_eq: true
    });
  },

  async getFeedByUsername(ctx, username, format) {
    const user = await strapi.plugins['users-permissions'].models.user.findOne({username});

    const feed = this.createFeedInstance();

    if (user) {
      const posts = await strapi.models.post
        .find({author: user.id, publishedAt: {$lte: new Date()}, enable: true})
        .sort({publishedAt: 'desc'})
        .limit(5);

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

  permissionFilter: (query) => {
    return {
      ...(query || {}),
      publishedAt_lte: new Date().toISOString(),
      enable: true
    };
  },

  isPublish(post) {
    return post && post.enable && post.publishedAt && post.publishedAt.getTime() <= new Date().getTime();
  }
};
