'use strict';

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::image.image', () => ({
  findExtra(ctx) {
    return super.find(ctx);
  }
}));
