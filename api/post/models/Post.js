'use strict';

/**
 * Lifecycle callbacks for the `Post` model.
 */

module.exports = {
  lifecycles: {
    beforeCreate: async (model) => {
      model.name = strapi.services.post.getNameFromTitle(model.title);
    },

    async afterCreate(result) {
      await strapi.models.link.create({name: result.name, post: result._id});
    }
  }
};
