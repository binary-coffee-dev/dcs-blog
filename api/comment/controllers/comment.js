'use strict';

const svgCaptcha = require('svg-captcha');

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  captcha(ctx) {
    const captcha = svgCaptcha.create({
      size: 6,
      noise: 10
    });

    const token = strapi.services.comment.createCaptchaJwt(captcha.text, strapi.config.captchaSecret);

    ctx.send({
      captcha: captcha.data,
      token
    });
  },

  async createByCaptcha(ctx) {
    if (strapi.services.comment.checkCaptchaJwt(ctx.request.body.input.token, ctx.request.body.input.captcha, strapi.config.captchaSecret)) {
      const comment = {
        body: ctx.request.body.input.body,
        email: ctx.request.body.input.email,
        name: ctx.request.body.input.name,
        post: ctx.request.body.input.post,
        publishedAt: new Date()
      };

      return await strapi.services.comment.create(comment);
    }
    return new Error('invalid-captcha');
  }
};
