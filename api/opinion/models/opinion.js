'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/v3.x/concepts/models.html#life-cycle-callbacks)
 * to customize this model
 */

module.exports = {
  lifecycles: {
    afterCreate: async (result) => {
      const post = await strapi.services.post.findOne({id: result.post});
      await strapi.models.post.update({_id: post._id}, {$set: {likes: post.likes.toNumber() + 1}});
    },
    afterDelete: async (result) => {
      const post = await strapi.services.post.findOne({id: result.post});
      await strapi.models.post.update({_id: post._id}, {$set: {likes: post.likes.toNumber() - 1}});
    }
  }
};
