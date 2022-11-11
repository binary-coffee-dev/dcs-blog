'use strict';

module.exports = {
  version: '1.8.0',
  description: 'Update readingTime attribute from post model',
  migrate: async () => {
    const articles = await strapi.models.post.find({});
    for (let post of articles) {
      await strapi.models.post.update({_id: post._id}, {$set: {readingTime: strapi.services.post.calculateReadingTime(post.body)}});
    }
  },
};
