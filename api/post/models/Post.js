'use strict';

/**
 * Lifecycle callbacks for the `Post` model.
 */

module.exports = {
  lifecycles: {
    async beforeCreate(model) {
      model.name = strapi.services.post.getNameFromTitle(model.title);
    },

    async afterCreate(result) {
      await strapi.models.link.create({name: result.name, post: result._id});
    },

    async beforeUpdate(params, data) {
      if (params._id && data.title) {
        const newName = strapi.services.post.getNameFromTitle(data.title);
        const titleChange = !(await strapi.services.link.existLinkInPost(newName, params._id));
        if (titleChange) {
          data.name = newName;
        }
      }
    },

    async afterUpdate(result, params, data) {
      if (params._id && data.title) {
        const newName = strapi.services.post.getNameFromTitle(result.title);
        const titleChange = !(await strapi.services.link.existLinkInPost(newName, params._id));
        if (titleChange) {
          await strapi.models.link.create({name: result.name, post: result._id});
        }
      }
    },

    async afterDelete() {
      // toDo 26.09.21, guille, remove links
    }
  }
};
