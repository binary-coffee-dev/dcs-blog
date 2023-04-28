'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

module.exports = createCoreService('api::podcast.podcast', ({strapi}) => ({
  async findOneByIdentifier(identifier) {
    // return await strapi.episode.podcast.findOne({identifier}).populate(['episodes']);
    return await strapi.query('podcast').findOne({identifier});
  },
}));
