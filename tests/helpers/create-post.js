const randomName = require('./random-name');

module.exports = async function (strapi, postAttr = {}) {
  return strapi.query('api::post.post').create({
    data: {
      title: randomName(),
      name: randomName(),
      body: randomName(),
      enable: true,
      publishedAt: new Date(new Date() - 10),
      ...postAttr
    }
  });
};
