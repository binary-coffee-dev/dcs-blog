const randomName = require('./random-name');

module.exports = async function (strapi, postAttr = {}) {
  return strapi.query('api::post.post').create({
    title: randomName(),
    name: randomName(),
    body: randomName(),
    enable: true,
    published_at: new Date(new Date() - 10),
    ...postAttr
  });
};
