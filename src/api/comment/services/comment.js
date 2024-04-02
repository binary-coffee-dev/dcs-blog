'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

module.exports = createCoreService('api::comment.comment', ({strapi}) => ({
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
