'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/configurations/configurations.html#bootstrap
 */

module.exports = async () => {
  await require('./delivery.to.email.subscriptions').send('Binary Coffee Weekly Posts', 7);
  await Post.find({name: null}).then((posts) => {
    posts.forEach(async post => {
      if (!post.name) {
        await Post.update({_id: post._id}, {$set: {name: strapi.services.post.getNameFromTitle(post.title)}});
      }
    });
  });
};
