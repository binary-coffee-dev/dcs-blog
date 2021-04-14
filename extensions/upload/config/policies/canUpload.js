'use strict';

const MAX_UPLOAD_PER_DAY = 10;

/**
 * `canUpload` policy.
 */
module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx) && !strapi.services.post.isStaff(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const imageCount = await strapi.models.image.count({
      createdAt: {$gte: startOfDay, $lt: nextDay},
      user: ctx.state.user
    });
    if (imageCount >= MAX_UPLOAD_PER_DAY) {
      return ctx.forbidden();
    }
  }
  return await next();
};
