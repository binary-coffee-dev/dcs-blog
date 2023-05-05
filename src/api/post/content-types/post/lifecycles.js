'use strict';


module.exports = {
  async beforeCreate(event) {
    const {data} = event.params;
    data.name = strapi.service('api::post.post').getNameFromTitle(data.title);
    data.readingTime = strapi.service('api::post.post').calculateReadingTime(data.body);
  },

  async afterCreate(event) {
    const {result} = event;
    await strapi.query('api::link.link').create({data: {name: result.name, post: result.id}});
  },

  async beforeUpdate(event) {
    const {data, where} = event.params;
    if (where && data.title) {
      const newName = strapi.service('api::post.post').getNameFromTitle(data.title);
      const titleChange = !(await strapi.service('api::link.link').existLinkInPost(newName, where));
      if (titleChange) {
        data.name = newName;
      }
      data.readingTime = strapi.service('api::post.post').calculateReadingTime(data.body);
    }
  },

  async afterUpdate(event) {
    const {result} = event;
    if (result.id && result.title) {
      const newName = strapi.service('api::post.post').getNameFromTitle(result.title);
      const titleChange = !(await strapi.service('api::link.link').existLinkInPost(newName, {id: result.id}));
      if (titleChange) {
        await strapi.query('api::link.link').create({data: {name: result.name, post: result.id}});
      }
    }
  },

  async afterDelete() {
    // toDo 26.09.21, guille, remove links
  }
};
