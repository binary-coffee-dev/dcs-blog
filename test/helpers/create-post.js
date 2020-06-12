const randomName = require('./random-name');

module.exports = async function (strapi, postAttr = {}) {
  return strapi.models.post.create({
    title: randomName(),
    name: randomName(),
    body: randomName(),
    description: randomName(),
    enable: true,
    publishedAt: new Date(new Date() - 10),
    ...postAttr
  });
};
