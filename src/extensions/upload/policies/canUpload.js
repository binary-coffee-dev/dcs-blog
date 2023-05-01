'use strict';

module.exports = async (ctx, config, {strapi}) => {
  if (!strapi.service('api::post.post').isAdmin(ctx) && !strapi.service('api::post.post').isStaff(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const imageCount = await strapi.query('api::image.image').count({
      where: {
        $and: [
          {createdAt: {$lte: nextDay}},
          {createdAt: {$gte: startOfDay}}
        ],
        user: ctx.state.user.id
      }
    });
    if (imageCount >= strapi.config.custom.maxNumberOfUploadsPerDay) {
      console.log('Not allowed to upload images');
      return false;
    }
  }
  ctx.request.files.files.name = JSON.stringify({
    name: ctx.request.files.files.name,
    userId: ctx.state.user.id
  });
  return true;
};
