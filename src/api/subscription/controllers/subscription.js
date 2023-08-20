'use strict';

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::subscription.subscription', ({strapi}) => ({

  async subscribe(ctx) {
    return strapi.service('api::subscription.subscription').subscribe({args: ctx.request.body, ctx});
  },

  async verify(ctx) {
    // toDo (gonzalezext)[21.08.23]: check this
    return strapi.service('api::subscription.subscription').verify({args: ctx.request.body, ctx});
  },

  async unsubscribe(ctx) {
    // toDo (gonzalezext)[21.08.23]: check this
    return strapi.service('api::subscription.subscription').unsubscribe({args: ctx.request.body, ctx});
  }
}));
