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
      if (entity.enable && entity.publishedAt && entity.publishedAt.getTime() <= new Date().getTime()) {
        prev.push(sanitizeEntity(entity, {model: strapi.models.post}));
      }
      return prev;
    }, []);
  },

  async findOneByName(ctx, next, {populate} = {}) {
    const name = ctx.params.name || ctx.params._name || '';
    const params = {name};
    const filters = convertRestQueryParams(params);
    return buildQuery({
      model: Post,
      filters,
      populate: populate || ''
    }).then(async (posts) => {
      if (posts && posts.length > 0) {
        const post = posts[0];
        post.views = `${parseInt(post.views || 0) + 1}`;
        await Post.update({name}, {$set: {views: post.views}});
        return post;
      }
      return null;
    });
  }
};
