'use strict';

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

module.exports = async (ctx, config, {strapi}) => {

  // this should be executed when editing
  if (ctx.args.id) {
    const post = await strapi.query('api::post.post').findOne({where: {id: ctx.args.id}, populate: ['author']});

    if (post.publishedAt && new Date(post.publishedAt).getTime() <= new Date().getTime()) {
      // do nothing with published articles
      delete ctx.args.data.publishedAt;
      return true;
    }
  }

  // minimum time to publish an article is 30min if the user is not an admin
  if (Boolean(ctx.args.data.publishedAt) && !strapi.service('api::post.post').isAdmin(ctx)) {
    let date = addMinutes(new Date(), 30);
    if (new Date(ctx.args.data.publishedAt) < date) {
      ctx.args.data.publishedAt = date;
    }
  } else if (!ctx.args.data.publishedAt) {
    delete ctx.args.data.publishedAt;
  }

  ctx.args.data.adminApproval = !(!strapi.service('api::post.post').isStaff(ctx) &&
    !strapi.service('api::post.post').isAdmin(ctx));
  return true;
};
