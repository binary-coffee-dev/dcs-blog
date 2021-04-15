'use strict';

/**
 * Lifecycle callbacks for the `comment` model.
 */

module.exports = {
  lifecycles: {
    // After destroying a value.
    afterDelete: async (model) => {
      await strapi.services.post.updateComments(model.post);
    },
    // After comment is created
    afterCreate: async (model) => {
      await strapi.services.post.updateComments(model.post);
    }
  }
};
