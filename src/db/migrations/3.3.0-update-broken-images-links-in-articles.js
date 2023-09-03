'use strict';

const migration = {
  version: '3.3.0',
  description: 'Update broken images links in articles.',

  migrate: async () => {
    let posts = await strapi.query('api::post.post').findMany({where: {}});
    for (let post of posts) {
      const updatedPost = migration.fixOldLinksReferences(post);
      await strapi.query('api::post.post').update({
        where: {id: updatedPost.id},
        data: updatedPost
      });
    }
  },

  fixOldLinksReferences(post) {
    const body = post.body.replaceAll('api.binary-coffee.dev', 'api.binarycoffee.dev');
    return {...post, body};
  }
};

module.exports = migration;
