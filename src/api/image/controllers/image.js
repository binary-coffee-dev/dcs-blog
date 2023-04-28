'use strict';

const {createCoreController} = require('@strapi/strapi').factories;

module.exports = createCoreController('api::image.image', ({strapi}) => ({
  findExtra(ctx) {
    return super.find(ctx);
  }
}));
