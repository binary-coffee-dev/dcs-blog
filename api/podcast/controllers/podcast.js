'use strict';

const {sanitizeEntity} = require('strapi-utils');

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  podcastByIdentifier: async (ctx) => {
    // toDo 24.03.23, guille, we should take in consideration that the list of episodes can be large in the future
    const podcast = await strapi.services.podcast.findOneByIdentifier(ctx.params.identifier || ctx.params._identifier );
    return sanitizeEntity(podcast || {}, {model: strapi.models.podcast});
  }
};
