'use strict';

/**
 * Lifecycle callbacks for the `comment` model.
 */

module.exports = {
  lifecycles: {
    // After destroying a value.
    afterDestroy: async (model, attrs) => {
      if (attrs && attrs.post) {
        await strapi.services.post.updateComments(attrs.post.id);
      }
    },
    // After comment is created
    afterCreate: async (model) => {
      await strapi.services.post.updateComments(model.post);
    }
  }
};
