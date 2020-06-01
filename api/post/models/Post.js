'use strict';

/**
 * Lifecycle callbacks for the `Post` model.
 */

module.exports = {
  lifecycles: {
    // Before creating a value.
    beforeCreate: async (model) => {
      model.name = strapi.services.post.getNameFromTitle(model.title);
    },

    // Before updating a value.
    beforeUpdate: async (model) => {
      if (model._update && model._update.title) {
        model._update.name = strapi.services.post.getNameFromTitle(model._update.title);
      }
    },
  }
};
