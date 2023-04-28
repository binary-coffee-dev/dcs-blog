'use strict';

module.exports = {
  // After destroying a value.
  afterDelete: async (event) => {
    const {result} = event;
    if (result.post && result.post.id) {
      await strapi.services.post.updateComments(result.post.id);
    }
  },
  // After comment is created
  afterCreate: async (event) => {
    const {result} = event;
    if (result.post && result.post.id) {
      await strapi.services.post.updateComments(result.post.id);
    }
  }
};
