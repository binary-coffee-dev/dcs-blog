'use strict';

const {createCoreRouter} = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::subscription.subscription', {
  prefix: ''
});
