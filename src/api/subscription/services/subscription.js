'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

const ejs = require('ejs');
const minify = require('html-minifier').minify;


module.exports = createCoreService('api::subscription.subscription', () => ({
  isSubscribedToday(lastSubscriptionTime) {
    const date = new Date(lastSubscriptionTime);
    return date < strapi.config.functions.dateUtil.getEndDay() &&
      date > strapi.config.functions.dateUtil.getStartDay();
  },

  async subscribe({args}) {
    const FIRST_ELEMENT = 0;

    const {email} = args;

    const value = await strapi.query('api::subscription.subscription').findMany({where: {email}});
    if (value.length === 0 || (value.length > 0 && !value[FIRST_ELEMENT].verified)) {

      const token = strapi.config.functions.token.generate(100);
      const unsubscribeToken = strapi.config.functions.token.generate(100);

      const subscription = value.length === 0 ? await strapi.query('api::subscription.subscription').create({
        data: {
          email,
          token,
          unsubscribeToken,
          lastSubscriptionTime: new Date()
        }
      }) : value[FIRST_ELEMENT];

      await strapi.query('api::subscription.subscription').update({
        where: {email},
        data: {lastSubscriptionTime: new Date()}
      });

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

      return {verified: subscription.verified};
    } else if (value.length > 0) {
      return {verified: value[FIRST_ELEMENT].verified};
    }
    return null;
  },

  async unsubscribe({args}) {
    const {unsubscribeToken} = args;
    const subscriptions = await strapi.query('api::subscription.subscription').findMany({where: {unsubscribeToken}});

    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const subsUpdated = await strapi.query('api::subscription.subscription').update({
        where: {id: subscription.id},
        data: {verified: false}
      });

      return {verified: subsUpdated.verified};
    }
    return null;
  },

  async verify({args}) {
    const {token} = args;
    const subscriptions = await strapi.query('api::subscription.subscription').findMany({where: {token}});
    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const subsUpdated = await strapi.query('api::subscription.subscription').update({
        where: {id: subscription.id},
        data: {enable: true, verified: true}
      });

      return {verified: subsUpdated.verified};
    }
    return null;
  },
}));
