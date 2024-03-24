'use strict';


// noinspection JSUnusedGlobalSymbols
module.exports = {
  async beforeCreate(event) {
    const {data} = event.params;
    data.name = strapi.service('api::post.post').getNameFromTitle(data.title);
    data.readingTime = strapi.service('api::post.post').calculateReadingTime(data.body);
  },

  async afterCreate(event) {
    const {result} = event;
    await strapi.query('api::link.link').create({data: {name: result.name, post: result.id}});

    const post = await strapi.query('api::post.post').findOne({where: {id: result.id}, populate: ['author']});
    await strapi.service('api::post.post').checkAndSendPublishedArticleNotification(post);
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

      // save publishedAt status
      const posts = await strapi.query('api::post.post').findMany({where});
      if (posts.length === 1) {
        event.state.isPublishedBefore = strapi.service('api::post.post').isPublishedSet(posts[0]);
      }
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

    if ('isPublishedBefore' in event.state) {
      const post = await strapi.query('api::post.post').findOne({where: {id: result.id}, populate: ['author']});
      await strapi.service('api::post.post').checkAndSendPublishedArticleNotification(post, event.state.isPublishedBefore);
    }
  },

  async afterDelete() {
    // toDo 26.09.21, guille, remove links
  }
};
