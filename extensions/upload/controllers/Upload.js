'use strict';

const Uploads = require('../../../node_modules/strapi-plugin-upload/controllers/Upload');

const CREATED_ELEMENT = 0;

module.exports = {
  ...Uploads,
  async upload(ctx) {
    const upload = await Uploads.upload(ctx);
    await strapi.services.image.create({image: [ctx.body[CREATED_ELEMENT].id], user: ctx.state.user.id});
    return upload;
  },

  async findConnection(ctx) {
    const values = await strapi.plugins['upload'].services.upload.fetchAll(
      ctx.query
    );
    removeQueries(['limit', 'start'], ctx);
    await Uploads.count(ctx);

    ctx.send({
      values,
      aggregate: {
        count: ctx.body.count
      }
    });
  }
};

function removeQueries(delQueries, ctx) {
  delQueries.forEach(query => {
    delete ctx.query[query];
    delete ctx.query[`_${query}`];
  });
}
