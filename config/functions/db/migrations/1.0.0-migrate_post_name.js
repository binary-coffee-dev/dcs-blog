'use strict';

module.exports = {
  version: '1.0.0',
  description: 'Migrate post name attribute to the current setup',
  migrate: async () => {
    await strapi.models.post.find({name: null}).then((posts) => {
      posts.forEach(async post => {
        if (!post.name) {
          await strapi.models.post.update({_id: post._id}, {$set: {name: strapi.services.post.getNameFromTitle(post.title)}});
        }
      });
    });
  }
};
