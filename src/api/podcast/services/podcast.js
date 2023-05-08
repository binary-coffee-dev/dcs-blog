'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

module.exports = createCoreService('api::podcast.podcast', ({strapi}) => ({
  async findOneByIdentifier(identifier) {
    return await strapi.query('api::podcast.podcast').findOne({where: {identifier}});
  },
}));
