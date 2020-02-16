'use strict';

/**
 * Read the documentation () to implement custom service functions
 */

module.exports = {
  getNameFromTitle: (title) => {
    title = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    title = title.replace(/[^0-9a-z-A-Z ]/g, "").replace(/ +/, " ");
    let result = '', subVal = '';
    for (let i = 0; i < title.length; i++) {
      if (title[i] === ' ') {
        result += (result !== '' && subVal ? '-' : '') + subVal;
        subVal = '';
      } else {
        subVal += title[i];
      }
    }
    return result + (result && subVal !== '' ? '-' : '') + subVal;
  },

  async updateComments(postId) {
    const countOfComments = await strapi.services.comment.count({post: postId});
    await strapi.services.post.update({id: postId}, {comments: countOfComments});
  },

  async getPublicPostsOfLastDays(days) {
    var date = new Date();
    date.setDate(date.getDate() - days);
    return await strapi.query("post").find({
      publishedAt_gt: date,
      enable_eq: true
    });
  }
};
