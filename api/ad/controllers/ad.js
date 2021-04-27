'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async findRandom(ctx) {
    const limit = Math.min(ctx.params._limit | 6, 6);

    const list = await strapi.models.ad.aggregate([
      {$match: {'country': ctx.params._country}},
      {$sample: {size: limit}}
    ]);
    return list;
  }
};
