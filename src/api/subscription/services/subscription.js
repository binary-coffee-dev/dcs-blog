'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

const ejs = require('ejs');
const minify = require('html-minifier').minify;


module.exports = createCoreService('api::subscription.subscription', () => ({
  async subscribe({args, ctx}) {
    const FIRST_ELEMENT = 0;

    const {email} = args;

    const value = await strapi.query('api::subscription.subscription').findMany({where: {email}});
    if (value.length === 0 || (value.length > 0 && !value[FIRST_ELEMENT].verified)) {
      const token = strapi.service('api::subscription.subscription').generateToken(100);
      const unsubscribeToken = strapi.service('api::subscription.subscription').generateToken(100);

      const subscription = value.length === 0 ? await strapi.service('api::subscription.subscription').create({
        data: {
          email,
          token,
          unsubscribeToken
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

      return await strapi.controller('api::subscription.subscription').sanitizeOutput(subscription, ctx);
    } else if (value.length > 0) {
      return value[FIRST_ELEMENT];
    }
    return null;
  },

  async unsubscribe({args, ctx}) {
    const {unsubscribeToken} = args;
    const subscriptions = await strapi.query('api::subscription.subscription').findMany({where: {unsubscribeToken}});

    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const subsUpdated = await strapi.query('api::subscription.subscription').update({
        where: {id: subscription.id},
        data: {verified: false}
      });

      return await strapi.controller('api::subscription.subscription').sanitizeOutput(subsUpdated, ctx);
    }
    return null;
  },

  async verify({args, ctx}) {
    const {token} = args;
    const subscriptions = await strapi.query('api::subscription.subscription').findMany({where: {token}});
    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const subsUpdated = await strapi.query('api::subscription.subscription').update({
        where: {id: subscription.id},
        data: {enable: true, verified: true}
      });

      return await strapi.controller('api::subscription.subscription').sanitizeOutput(subsUpdated, ctx);
    }
    return null;
  },

  generateToken(size = 12) {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_';
    return new Array(size)
      .fill(undefined)
      .map(() => characters[Math.floor(Math.random() * characters.length)])
      .reduce((prev, ch) => prev + ch, '');
  },
}));
