'use strict';

// toDo (gonzalezext)[28.04.23]: add to custom values
const CREATED_ELEMENT = 0;
const MAX_FILE_LIMIT = 5;
const MIN_FILE_START = 0;

module.exports = (controller) => {
  const oldUploadFunction = controller.upload;
  controller.upload = async function(ctx) {
    const upload = await oldUploadFunction(ctx);
    await strapi.query('image').create({image: [ctx.body[CREATED_ELEMENT].id], user: ctx.state.user.id});
    return upload;
  };

  controller.findConnection = async function(ctx) {
    let values;
    const limit = Math.min(ctx.query.limit || ctx.query._limit || MAX_FILE_LIMIT, MAX_FILE_LIMIT);
    const start = Math.max(ctx.query.start || ctx.query._start || MIN_FILE_START, MIN_FILE_START);
    if (strapi.service('api::post.post').isAuthenticated(ctx)) {
      const images = await strapi.query('image').find({
        user: ctx.state.user.id,
        _limit: limit,
        _start: start,
        _sort: 'created_at:DESC'
      });
      values = images.map(image => image.image[0]);
    } else {
      values = await strapi.plugins['upload'].services.upload.fetchAll(ctx.query);
    }
    ctx.send({values});
  };

  const oldCountFunction = controller.count;
  controller.count = async function(ctx) {
    if (strapi.service('api::post.post').isAuthenticated(ctx)) {
      return await strapi.query('image').count({user: ctx.state.user.id});
    } else {
      return await oldCountFunction(ctx.query);
    }
  };

  const oldDestroyFunction = controller.destroy;
  controller.destroy = async function(ctx) {
    const { id } = ctx.params;
    const uploadFile = await strapi.query('file', 'upload').findOne({id});
    if (uploadFile && uploadFile.related.length) {
      await strapi.query('image').delete({id: uploadFile.related[0].id});
    }
    await oldDestroyFunction(ctx);
  };
};
