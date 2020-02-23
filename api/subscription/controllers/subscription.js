'use strict';

const ejs = require('ejs');
const minify = require('html-minifier').minify;

const FIRST_ELEMENT = 0;

module.exports = {
  async subscribe(ctx) {
    const email = ctx.request.body.email;
    const value = await strapi.services.subscription.find({email});
    if (value.length === 0 || (value.length > 0 && !value[FIRST_ELEMENT].verified)) {
      const token = strapi.services.subscription.generateToken(100);
      const subscription = value.length === 0 ? await strapi.services.subscription.create({
        email,
        token
      }) : value[FIRST_ELEMENT];
      const verifyLink = `${strapi.config.siteUrl}/verify/${subscription.token}`;

      let html = await new Promise((resolve, reject) => {
        ejs.renderFile(
          './api/subscription/controllers/subscription-email-template.html',
          {verifyLink},
          {},
          function (err, str) {
            if (err)
              reject(err);
            else
              resolve(str);
          });
      });
      html = minify(html, {collapseWhitespace: true, removeComments: true, removeTagWhitespace: true});

      await strapi.plugins['email'].services.email.send({
        to: email,
        subject: 'Binary Coffee subscription',
        html
      });
      return {...subscription, token: undefined, email: undefined};
    } else if (value.length > 0) {
      return value[FIRST_ELEMENT];
    }
    return null;
  },

  async verify(ctx) {
    const token = ctx.request.body.token;
    const subscriptions = await strapi.services.subscription.find({token});
    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const subsUpdated = await strapi.services.subscription.update({id: subscription.id}, {
        enable: true,
        verified: true
      });
      ctx.send({...subsUpdated, token: undefined, email: undefined});
    }
    return null;
  }
};
