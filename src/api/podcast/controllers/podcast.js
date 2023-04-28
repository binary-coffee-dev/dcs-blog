'use strict';

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::podcast.podcast', ({strapi}) => ({
  async podcastByIdentifier(ctx) {
    // toDo 24.03.23, guille, we should take in consideration that the list of episodes can be large in the future
    const podcast = await strapi.service('api::podcast.podcast').findOneByIdentifier(ctx.params.identifier || ctx.params._identifier);
    return this.sanitizeOutput(podcast || {}, ctx);
  }
}));
