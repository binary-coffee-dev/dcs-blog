const randomName = require('./random-name');

module.exports = async function (strapi, podcast) {
  return await strapi.query('api::episode.episode').create({
    data: {
      title: randomName(),
      url: 'http://eso.com',
      description: randomName(),
      banner: 'http://banner',
      duration: 123,
      date: new Date(),
      podcast
    }
  });
};
