'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

module.exports = createCoreService('api::opinion.opinion', ({strapi}) => ({
  async count(where, user) {
    if (where.user && where.user === 'current') {
      where.user = user && user.id || undefined;
    }
    if (where.post) {
      const link = await strapi.query('api::link.link').findOne({where: {name: where.post}});
      const post = await strapi.query('api::post.post').findOne({where: {id: link.post.id}});
      if (post) {
        const query = {...where, post: post.id};
        return await strapi.query('api::opinion.opinion').count({where: query});
      }
    }
    return await strapi.query('api::opinion.opinion').count({where});
  }
}));
