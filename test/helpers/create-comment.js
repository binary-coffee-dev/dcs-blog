const randomName = require('./random-name');

module.exports = async function (strapi, commentAttr = {}) {
  return strapi.query('comment').create({
    body: randomName(),
    ...commentAttr
  });
};
