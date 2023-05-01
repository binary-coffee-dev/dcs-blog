'use strict';

module.exports = {
  beforeDelete: async (event) => {
    const {where} = event.params;
    const commentToBeRemoved = await strapi.query('api::comment.comment').findOne({where, populate: ['post']});
    event.state.postId = commentToBeRemoved.post.id;
  },
  afterDelete: async (event) => {
    const {state} = event;
    if (state && state.postId) {
      await strapi.service('api::post.post').updateComments(state.postId);
    }
  },
  afterCreate: async (event) => {
    const {result} = event;
    const comment = await strapi.query('api::comment.comment').findOne({where: {id: result.id}, populate: ['post']});
    if (comment && comment.post && comment.post.id) {
      await strapi.service('api::post.post').updateComments(comment.post.id);
    }
  }
};
