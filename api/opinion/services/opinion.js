'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/services.html#core-services)
 * to customize this service
 */

module.exports = {
  async count(where, user) {
    if (where.user && where.user === 'current') {
      where.user = user && user.id || undefined;
    }
    if (where.post) {
      const link = await strapi.models.link.findOne({name: where.post});
      const post = await strapi.models.post.findOne({_id: link.post});
      if (post) {
        const query = {...where, post: post.id.toString()};
        return await strapi.models.opinion.count(query);
      }
    }
    return await strapi.models.opinion.count(where);
  }
};
