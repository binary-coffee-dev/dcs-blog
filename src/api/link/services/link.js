'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

const SIZE_OF_RANDOM_TEXT = 5;

module.exports = createCoreService('api::link.link', ({strapi}) => ({
  async existLinkInPost(postName, where) {
    // toDo 01.05.23, guille, this can be done in just one query
    const links = await strapi.query('api::link.link').findMany({where: {post: where.id}});
    return links.some(link => link && link.name &&
      link.name.substring(0, link.name.length - SIZE_OF_RANDOM_TEXT) === postName.substring(0, postName.length - SIZE_OF_RANDOM_TEXT));
  }
}));
