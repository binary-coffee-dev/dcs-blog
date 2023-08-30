'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

const moment = require('moment-timezone');

module.exports = createCoreService('api::comment.comment', ({strapi}) => ({
  async create(body, postId, userId) {
    const comment = await strapi.query('api::comment.comment').create({
      data: {
        body,
        post: postId,
        user: userId,
        published_at: new Date()
      }
    });

    // toDo (gonzalezext)[21.08.23]: rework this code
    if (strapi.config.environment !== 'test' && strapi.config.custom.enableBotNotifications) {
      const post = await strapi.query('api::post.post').findOne({where: {id: postId}});
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
    await strapi.query('api::comment.comment').update({where: {id: postId}, data: {body}});
    return await strapi.query('api::comment.comment').findOne({where: {id: postId}});
  },

  async recentComments(limit = strapi.config.custom.maxRecentComments) {
    limit = Math.min(limit, strapi.config.custom.maxRecentComments);

    const comments = await strapi.query('api::comment.comment').findMany({
      where: {},
      limit: limit,
      orderBy: {createdAt: 'desc'},
      populate: ['post', 'user']
    });

    return comments.filter(comment => {
      return strapi.service('api::post.post').isPublish(comment.post);
    });
  }
}));
