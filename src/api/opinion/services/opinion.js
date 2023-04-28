'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

module.exports = createCoreService('api::opinion.opinion', ({strapi}) => ({
  async count(where, user) {
    if (where.user && where.user === 'current') {
      where.user = user && user.id || undefined;
    }
    if (where.post) {
      const link = await strapi.query('link').findOne({name: where.post});
      const post = await strapi.query('post').findOne({id: link.post.id});
      if (post) {
        const query = {...where, post: post.id};
        return await strapi.query('opinion').count(query);
      }
    }
    return await strapi.query('opinion').count(where);
  }
}));
