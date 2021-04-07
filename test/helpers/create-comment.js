const randomName = require('./random-name');

module.exports = async function (strapi, commentAttr = {}) {
  return strapi.models.comment.create({
    body: randomName(),
    ...commentAttr
  });
};
