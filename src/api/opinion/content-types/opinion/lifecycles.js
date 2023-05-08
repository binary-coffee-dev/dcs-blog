'use strict';

module.exports = {
  afterCreate: async (event) => {
    const {result} = event;
    const opinion = await strapi.query('api::opinion.opinion').findOne({where: {id: result.id}, populate: ['post']});
    await strapi.query('api::post.post').update({where: {id: opinion.post.id}, data: {likes: (+opinion.post.likes) + 1}});
  },
  beforeDelete: async (event) => {
    const {where} = event.params;
    const opinion = await strapi.query('api::opinion.opinion').findOne({where, populate: ['post']});
    event.state.postId = opinion.post.id;
  },
  afterDelete: async (event) => {
    const {postId} = event.state;
    if (postId) {
      const post = await strapi.query('api::post.post').findOne({where: {id: postId}});
      await strapi.query('api::post.post').update({where: {id: postId}, data: {likes: (+post.likes) - 1}});
    }
  }
};
