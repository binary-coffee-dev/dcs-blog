'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */
const FIRST_ELEMENT = 0;

module.exports = {
  async subscribe(ctx) {
    const email = ctx.request.body.email;
    const value = await strapi.services.subscription.find({email});
    if (value.length === 0 || (value.length > 0 && !value[FIRST_ELEMENT].verified)) {
      const token = strapi.services.subscription.generateToken(100);
      const subscription = value.length === 0 ? await strapi.services.subscription.create({email, token}) : value[FIRST_ELEMENT];
      const verifyLink = `${strapi.config.siteUrl}/verify/${subscription.token}`;
      await strapi.plugins['email'].services.email.send({
        to: email,
        subject: 'Binary Coffee subscription',
        html: `<h1>You are subscribed to Binary Coffee website News</h1><a href="${verifyLink}">Verify subscription</a>`
      });
      return {...subscription, token: undefined, email: undefined};
    } else if(value.length > 0) {
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
