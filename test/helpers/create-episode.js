const randomName = require('./random-name');

module.exports = async function (strapi, podcast) {
  return await strapi.models.episode.create({
    title: randomName(),
    url: 'http://eso.com',
    description: randomName(),
    banner: 'http://banner',
    duration: 123,
    date: new Date(),
    podcast
  });
};
