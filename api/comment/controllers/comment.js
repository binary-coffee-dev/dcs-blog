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
  }
};
