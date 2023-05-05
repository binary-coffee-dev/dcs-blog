'use strict';

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::opinion.opinion', ({strapi}) => ({
  async count(ctx) {
    const where = ctx.params._where || ctx.params.where || null;
    const user = ctx.state && ctx.state.user;
    if (where) {
      return await strapi.service('api::opinion.opinion').count(where, user);
    }
    return 0;
  },
}));
