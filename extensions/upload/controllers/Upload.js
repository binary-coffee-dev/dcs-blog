const _ = require('lodash');

const Uploads = require('../../../node_modules/strapi-plugin-upload/controllers/Upload');

module.exports = _.merge(Uploads, {
  async findConnection(ctx) {
    await Uploads.find(ctx);
    const values = ctx.body;
    removeQueries(['limit', 'start'], ctx);
    await Uploads.count(ctx);

    ctx.send({
      values,
      aggregate: {
        count: ctx.body.count
      }
    });
  }
});

function removeQueries(delQueries, ctx) {
  delQueries.forEach(query => {
    delete ctx.query[query];
    delete ctx.query[`_${query}`];
  });
}
