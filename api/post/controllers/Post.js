'use strict';

const {sanitizeEntity, buildQuery, convertRestQueryParams} = require('strapi-utils');

/**
 * Read the documentation () to implement custom controller functions
 */

module.exports = {
  async find(ctx) {
    let entities;

    if (ctx.query._q) {
      entities = await strapi.services.post.search(ctx.query);
    } else {
      entities = await strapi.services.post.find(ctx.query);
    }

    return entities.reduce((prev, entity) => {
      if (entity.enable) {
        prev.push(sanitizeEntity(entity, {model: strapi.models.post}));
      }
      return prev;
    }, []);
  },
  async findOneByName(ctx, next, {populate} = {}) {
    const params = {name: ctx.params.name || ctx.params._name || ''};
    const filters = convertRestQueryParams(params);
    return buildQuery({
      model: Post,
      filters,
      populate: populate || ''
    }).then((array) => {
      if (array && array.length > 0) {
        return array[0];
      }
      return null;
    });
  }
};
