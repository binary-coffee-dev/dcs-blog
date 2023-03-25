'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-services)
 * to customize this service
 */

module.exports = {
  async findOneByIdentifier(identifier) {
    return await strapi.models.podcast.findOne({identifier}).populate(['episodes']);
  },
};
