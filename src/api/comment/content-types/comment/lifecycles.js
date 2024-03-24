'use strict';

const moment = require('moment-timezone');

module.exports = {
  beforeDelete: async (event) => {
    const {where} = event.params;
    const commentToBeRemoved = await strapi.query('api::comment.comment').findOne({where, populate: ['post']});
    event.state.postId = commentToBeRemoved.post.id;
  },
  afterDelete: async (event) => {
    const {state} = event;
    if (state && state.postId) {
      await strapi.service('api::post.post').updateComments(state.postId);
    }
  },
  afterCreate: async (event) => {
    const {result} = event;
    const comment = await strapi.query('api::comment.comment').findOne({
      where: {id: result.id},
      populate: ['post', 'user']
    });
    if (comment && comment.post && comment.post.id) {
      await strapi.service('api::post.post').updateComments(comment.post.id);
    }

    // toDo (gonzalezext)[21.08.23]: rework this code
    if (strapi.config.custom.enableBotNotifications) {
      const post = await strapi.query('api::post.post').findOne({where: {id: result.id}, populate: ['user']});

      const msg = '*NEW COMMENT*\n'
        + `*Date:* ${moment(comment.publishedAt).tz('America/Havana').format('DD MMMM hh:mm:ss A')}\n`
        // + `*Post title:* ${post.title} \n`
        + `*Post:* [${post.title}](${strapi.config.custom.siteUrl}/post/${post.name})\n`
        + `*User:* ${comment.user.username}\n`
        + `*Comment:* \`${comment.body}\`\n\n`;

      await strapi.config.functions.sendBotNotification(strapi, msg);
    }
  }
};
