'use strict';

/**
 * `canUpload` policy.
 */
module.exports = async (ctx, next) => {
  if (!strapi.services.post.isAdmin(ctx) && !strapi.services.post.isStaff(ctx)) {
    const startOfDay = strapi.config.functions.dateUtil.getStartDay();
    const nextDay = strapi.config.functions.dateUtil.getEndDay();
    const imageCount = await strapi.query('image').count({
      created_at_lte: nextDay,
      created_at_gte: startOfDay,
      user: ctx.state.user.id
    });
    if (imageCount >= strapi.config.custom.maxNumberOfUploadsPerDay) {
      return ctx.forbidden();
    }
  }
  return await next();
};
