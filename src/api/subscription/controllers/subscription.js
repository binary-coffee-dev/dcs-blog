'use strict';

const {createCoreController} = require('@strapi/strapi').factories;

const ejs = require('ejs');
const minify = require('html-minifier').minify;

module.exports = createCoreController('api::subscription.subscription', ({strapi}) => ({
  async subscribe(ctx) {
    const FIRST_ELEMENT = 0;
    const email = ctx.request.body.email;
    const value = await strapi.service('api::subscription.subscription').findMany({where: {email}});
    if (value.length === 0 || (value.length > 0 && !value[FIRST_ELEMENT].verified)) {
      const token = strapi.service('api::subscription.subscription').generateToken(100);
      const subscription = value.length === 0 ? await strapi.service('api::subscription.subscription').create({
        data: {
          email,
          token
        }
      }) : value[FIRST_ELEMENT];
      const verifyLink = `${strapi.config.custom.siteUrl}/verify/${subscription.token}`;

      let html = await new Promise((resolve, reject) => {
        ejs.renderFile(
          './public/subscription-email-template.html',
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
    const subscriptions = await strapi.service('api::subscription.subscription').findMany({where: {token}});
    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const subsUpdated = await strapi.service('api::subscription.subscription').update({
        where: {id: subscription.id},
        data: {enable: true, verified: true}
      });
      ctx.send({...subsUpdated, token: undefined, email: undefined});
    }
    return null;
  }
}));
