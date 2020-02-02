'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async subscribe(ctx) {
    const token = strapi.services.subscription.generateToken(100);
    const email = ctx.request.body.input.email;
    const value = await strapi.services.subscription.find({email});
    if (value.length === 0) {
      const subscription = await strapi.services.subscription.create({email, token});
      const verifyLink = `${strapi.config.apiUrl}/verify/${token}`;
      const response = await strapi.plugins['email'].services.email.send({
        to: 'ggjnez92@gmail.com',
        subject: 'Binary Coffee subscription',
        html: `<h1>You are subscribed to Binary Coffee website News</h1><a href="${verifyLink}">Verify subscription</a>`
      });
      if (response.rejected.length > 0) {
        ctx.status = 201;
      }
    }
  },

  async verify(ctx) {
    const token = ctx.request.body.token;
    const subscriptions = await strapi.services.subscription.find({token});
    if (subscriptions.length > 0) {
      const subscription = subscriptions[0];
      const subsUpdated = await strapi.services.subscription.update({id: subscription.id}, {enable: true, verified: true});
      ctx.send({...subsUpdated, token: undefined, email: undefined});
    }
    return null;
  }
};
