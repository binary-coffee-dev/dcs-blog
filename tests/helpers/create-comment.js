const randomName = require('./random-name');

module.exports = async function (strapi, commentAttr = {}) {
  return strapi.query('api::comment.comment').create({
    data: {
      body: randomName(),
      ...commentAttr
    }
  });
};
