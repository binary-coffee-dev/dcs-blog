'use strict';

/**
 * Lifecycle callbacks for the `comment` model.
 */

module.exports = {
  lifecycles: {
    // After destroying a value.
    afterDelete: async (model) => {
      if (model.post && model.post.id) {
        await strapi.services.post.updateComments(model.post.id);
      }
    },
    // After comment is created
    afterCreate: async (model) => {
      if (model.post && model.post.id) {
        await strapi.services.post.updateComments(model.post.id);
      }
    }
  }
};
