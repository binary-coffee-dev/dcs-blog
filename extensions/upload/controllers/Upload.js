'use strict';

const Uploads = require('../../../node_modules/strapi-plugin-upload/controllers/Upload');

const CREATED_ELEMENT = 0;
const MAX_FILE_LIMIT = 5;
const MIN_FILE_START = 0;

module.exports = {
  ...Uploads,
  async upload(ctx) {
    const upload = await Uploads.upload(ctx);
    await strapi.services.image.create({image: [ctx.body[CREATED_ELEMENT].id], user: ctx.state.user.id});
    return upload;
  },

  async findConnection(ctx) {
    let values;
    if (strapi.services.post.isAuthenticated(ctx)) {
      const images = await strapi.models.image
        .find({user: ctx.state.user.id})
        .limit(Math.min(ctx.query.limit || ctx.query._limit || MAX_FILE_LIMIT, MAX_FILE_LIMIT))
        .skip(Math.max(ctx.query.start || ctx.query._start || MIN_FILE_START, MIN_FILE_START))
        .sort({createdAt: -1});
      values = images.map(image => image.image[0]);
    } else {
      values = await strapi.plugins['upload'].services.upload.fetchAll(ctx.query);
    }
    ctx.send({values});
  },

  async count(ctx) {
    if (strapi.services.post.isAuthenticated(ctx)) {
      return await strapi.models.image.count({user: ctx.state.user.id});
    } else {
      return await strapi.plugins['upload'].services.upload.count(ctx.query);
    }
  },

  async destroy(ctx) {
    const { id } = ctx.params;
    const image = await strapi.services.image.findOne({image: [id]});
    if (image) {
      await strapi.models.image.deleteOne({_id: image.id});
    }
    await Uploads.destroy(ctx);
  }
};
