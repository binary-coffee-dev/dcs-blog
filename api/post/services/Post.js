'use strict';

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
    await Post.update({name: post.name}, {$set: {views}});
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
