'use strict';

/**
 * Lifecycle callbacks for the `Post` model.
 */

module.exports = {
  lifecycles: {
    // Before creating a value.
    beforeCreate: async (model) => {
      model.name = strapi.services.post.getNameFromTitle(model.title);
    }
  }
};
