'use strict';

const {createCoreRouter} = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::provider.provider', {
  prefix: ''
});
