'use strict';

const svgCaptcha = require('svg-captcha');
const Request = require('request');

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

    const token = strapi.services.comment.createCaptchaJwt(captcha.text, strapi.config.captchaSecret);

    ctx.send({
      captcha: captcha.data,
      token
    });
  },

  /**
   * @deprecated
   */
  async createByCaptcha(ctx) {
    if (strapi.services.comment.checkCaptchaJwt(ctx.request.body.input.token, ctx.request.body.input.captcha, strapi.config.captchaSecret)) {
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
      
      Request.post({
        "headers": { "content-type": "application/json" },
        "url": "https://botnotifier.binary-coffee.dev/notify/channel",
        "body": JSON.stringify({
          "Message": obj.body,
          "ChannelName": "bcStaffs"
        })
      }, (error, response, body) => {
          if(error) {
            return console.log(error);
          }
          console.log(JSON.parse(body));
      });
      
      return comment;
    }
    return new Error('invalid-data');
  }
};
