'use strict';

module.exports = {
  version: '1.6.0',
  description: 'Update likes attribute in post model',
  migrate: async () => {
    const articles = await strapi.models.post.find({});
    for (let i = 0; i < articles.length; i++) {
      const likes = await strapi.models.opinion.count({post: articles[i]._id, type: 'like'});
      const dislikes = await strapi.models.opinion.count({post: articles[i]._id, type: 'dislike'});

      await strapi.models.post.update({_id: articles[i]._id}, {$set: {likes: likes - dislikes}});
    }
  },
};
