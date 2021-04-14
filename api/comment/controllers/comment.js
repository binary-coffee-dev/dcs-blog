'use strict';

const {sanitizeEntity} = require('strapi-utils');
const svgCaptcha = require('svg-captcha');
const Request = require('request');
const moment = require('moment-timezone');
moment.locale('es_ES');

const MAX_RECENT_COMMENTS = 15;

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
module.exports = {

  /**
   * @deprecated
   */
  captcha(ctx) {
    const captcha = svgCaptcha.createMathExpr({
      noise: 10,
      mathMin: 0,
      mathMax: 9,
      mathOperator: '+'
    });

    const token = strapi.services.comment.createCaptchaJwt(captcha.text, strapi.config.custom.captchaSecret);

    ctx.send({
      captcha: captcha.data,
      token
    });
  },

  /**
   * @deprecated
   */
  async createByCaptcha(ctx) {
    if (strapi.services.comment.checkCaptchaJwt(ctx.request.body.input.token, ctx.request.body.input.captcha, strapi.config.custom.captchaSecret)) {
      const comment = {
        body: ctx.request.body.input.body,
        email: ctx.request.body.input.email,
        name: ctx.request.body.input.name,
        post: ctx.request.body.input.post,
        publishedAt: new Date()
      };

      const response = await strapi.services.comment.create(comment);
      await strapi.services.post.updateComments(comment.post);
      return response;
    }
    return new Error('invalid-captcha');
  },

  async create(ctx) {
    const obj = {
      body: ctx.request.body.body,
      post: ctx.request.body.post,
      user: ctx.state.user.id,
      publishedAt: new Date()
    };
    if (obj.body && obj.post && obj.user) {
      const comment = await strapi.services.comment.create(obj);
      await strapi.services.post.updateComments(comment.post);

      const post = await strapi.models.post.findOne({_id: comment.post});
      const postUrl = strapi.config.custom.siteUrl + '/post/' + post.name;
      const postTitle = post.title;

      // toDo 11.04.21: refactor this code, see issue #138
      if (strapi.config.environment !== 'test') {
        const date = moment(comment.publishedAt);
        const msg = '*--- NEW COMMENT ---*\n'
          + '*Date:* ' + date.tz('America/Havana').format('DD MMMM hh:mm:ss A') + '\n'
          + '*Post:* ' + '[' + postTitle + ']' + '(' + postUrl + ')' + '\n'
          + '*User:* ' + comment.user.username + '\n'
          + '*Comment:* ' + '`' + comment.body + '`' + '\n\n';

        Request.post({
          'headers': {'content-type': 'application/json'},
          'url': 'https://botnotifier.binary-coffee.dev/notify/channel',
          'body': JSON.stringify({
            'Message': msg,
            'ChannelName': 'bcStaffs'
          })
        });
      }

      return comment;
    }
    return new Error('invalid-data');
  },

  async recentComments(ctx) {
    let limit;
    if (ctx.params && ctx.params._limit) {
      limit = Math.min(ctx.params._limit, MAX_RECENT_COMMENTS);
    }
    const comments = await strapi.services.comment.recentComments(limit);
    ctx.send(sanitizeEntity(comments, {model: strapi.models.comment}));
  }
};
