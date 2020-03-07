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
    let values, count;
    if (strapi.services.post.isAuthenticated(ctx)) {
      const images = await Image
        .find({user: ctx.state.user.id})
        .limit(Math.min(ctx.query.limit || ctx.query._limit || MAX_FILE_LIMIT, MAX_FILE_LIMIT))
        .skip(Math.max(ctx.query.start || ctx.query._start || MIN_FILE_START, MIN_FILE_START))
        .sort({createdAt: -1});
      count = await Image.count({user: ctx.state.user.id});
      values = images.map(image => image.image[0]);
      console.log(images);
    } else {
      values = await strapi.plugins['upload'].services.upload.fetchAll(
        ctx.query
      );
      removeQueries(['limit', 'start'], ctx);
      await Uploads.count(ctx);
      count = ctx.body.count;
    }
    ctx.send({
      values,
      aggregate: {count}
    });
  }
};

function removeQueries(delQueries, ctx) {
  delQueries.forEach(query => {
    delete ctx.query[query];
    delete ctx.query[`_${query}`];
  });
}
