'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#life-cycle-callbacks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    afterCreate: async (result) => {
      const post = await strapi.query('post').findOne({id: result.post.id});
      await strapi.query('post').update({id: post.id}, {likes: (+post.likes) + 1});
    },
    afterDelete: async (result) => {
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
  }
};
