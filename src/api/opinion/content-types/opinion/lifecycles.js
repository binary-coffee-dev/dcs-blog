'use strict';

module.exports = {
  afterCreate: async (event) => {
    const {result} = event;
    const post = await strapi.query('post').findOne({id: result.post.id});
    await strapi.query('post').update({id: post.id}, {likes: (+post.likes) + 1});
  },
  afterDelete: async (event) => {
    const {result} = event;
    const posts = [];
    if (Array.isArray(result)) {
      result.forEach(r => r.post && posts.push(r.post.id));
    } else {
      posts.push(result.post.id);
    }
    for (const id of posts) {
      const post = await strapi.query('post').findOne({id});
      await strapi.query('post').update({id}, {likes: (+post.likes) - 1});
    }
  }
};
