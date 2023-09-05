'use strict';

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes*60000);
}

module.exports = async (ctx, config, { strapi }) => {

  // minimum time to publish an article is 30min if the user is not an admin
  if (!strapi.service('api::post.post').isAdmin(ctx)) {
    let date = addMinutes(new Date(), 30);
    if (new Date(ctx.args.data.publishedAt) < date) {
      ctx.args.data.publishedAt = date;
    }
  }

  ctx.args.data.adminApproval = !(!strapi.service('api::post.post').isStaff(ctx) &&
    !strapi.service('api::post.post').isAdmin(ctx));
  return true;
};
