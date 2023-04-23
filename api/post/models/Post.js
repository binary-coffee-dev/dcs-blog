'use strict';

/**
 * Lifecycle callbacks for the `Post` model.
 */

module.exports = {
  lifecycles: {
    async beforeCreate(model) {
      model.name = strapi.services.post.getNameFromTitle(model.title);
      model.readingTime = strapi.services.post.calculateReadingTime(model.body);
    },

    async afterCreate(result) {
      await strapi.query('link').create({name: result.name, post: result.id});
    },

    async beforeUpdate(params, data) {
      if (params.id && data.title) {
        const newName = strapi.services.post.getNameFromTitle(data.title);
        const titleChange = !(await strapi.services.link.existLinkInPost(newName, params.id));
        if (titleChange) {
          data.name = newName;
        }
        data.readingTime = strapi.services.post.calculateReadingTime(data.body);
      }
    },

    async afterUpdate(result, params, data) {
      if (params.id && data.title) {
        const newName = strapi.services.post.getNameFromTitle(result.title);
        const titleChange = !(await strapi.services.link.existLinkInPost(newName, params.id));
        if (titleChange) {
          await strapi.query('link').create({name: result.name, post: result.id});
        }
      }
    },

    async afterDelete() {
      // toDo 26.09.21, guille, remove links
    }
  }
};
