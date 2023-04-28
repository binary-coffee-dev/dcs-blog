'use strict';

const {createCoreService} = require('@strapi/strapi').factories;

const SIZE_OF_RANDOM_TEXT = 5;

module.exports = createCoreService('api::link.link', ({strapi}) => ({
  async existLinkInPost(postName, postId) {
    const links = await strapi.query('link').find({post: postId});
    return links.some(link => link && link.name &&
      link.name.substring(0, link.name.length - SIZE_OF_RANDOM_TEXT) === postName.substring(0, postName.length - SIZE_OF_RANDOM_TEXT));
  }
}));
