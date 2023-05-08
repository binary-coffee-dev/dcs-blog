module.exports = async function (strapi, episode) {
  await strapi.query('api::episode.episode').deleteMany({id: episode.id});
};
