'use strict';

module.exports = {
  version: '1.7.0',
  description: 'Setup for the fist time the link model with the posts names',
  migrate: async () => {
    const articles = await strapi.models.post.find({});
    for (let i = 0; i < articles.length; i++) {
      await strapi.models.link.create({name: articles[i].name, post: articles[i]._id});
    }
  },
};
