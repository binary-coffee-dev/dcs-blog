'use strict';

module.exports = async (ctx, config, { strapi }) => {
  if (!strapi.service('api::post.post').isAdmin(ctx) && !strapi.service('api::post.post').isStaff(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const imageCount = await strapi.query('image').count({
      created_at_lte: nextDay,
      created_at_gte: startOfDay,
      user: ctx.state.user.id
    });
    if (imageCount >= strapi.config.custom.maxNumberOfUploadsPerDay) {
      console.log('Not allowed to upload images');
      return false;
    }
  }
  return true;
};
