'use strict';

const moment = require('moment-timezone');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/services.html#core-services)
 * to customize this service
 */
module.exports = {
  async create(body, postId, userId) {
    const comment = await strapi.query('comment').create({
      body,
      post: postId,
      user: userId,
      published_at: new Date()
    });

    if (strapi.config.environment !== 'test' && strapi.config.custom.enableBotNotifications) {
      const post = await strapi.query('post').findOne({id: postId});
      const postUrl = strapi.config.custom.siteUrl + '/post/' + post.name;
      const postTitle = post.title;

      const msg = '*--- NEW COMMENT ---*\n'
        + '*Date:* ' + moment(comment.publishedAt).tz('America/Havana').format('DD MMMM hh:mm:ss A') + '\n'
        + '*Post:* ' + '[' + postTitle + ']' + '(' + postUrl + ')' + '\n'
        + '*User:* ' + comment.user.username + '\n'
        + '*Comment:* ' + '`' + comment.body + '`' + '\n\n';

      await strapi.config.functions.sendBotNotification(strapi, {message: msg});
    }

    return comment;
  },

  async update(postId, body) {
    await strapi.query('comment').update({id: postId}, {body});
    return await strapi.query('comment').findOne({id: postId});
  },

  async recentComments(limit = 8) {
    if (limit) {
      limit = Math.min(limit, strapi.config.custom.maxRecentComments);
    }

    const comments = await strapi.query('comment').find({
      _limit: limit,
      _sort: 'created_at:DESC'
    });

    return comments.filter(comment => {
      return strapi.services.post.isPublish(comment.post);
    });
  }
};
