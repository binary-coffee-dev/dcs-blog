'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async count(ctx) {
    const where = ctx.params._where || ctx.params.where || null;
    const user = ctx.state && ctx.state.user;
    if (where) {
      return await strapi.services.opinion.count(where, user);
    }
    return 0;
  }
};
