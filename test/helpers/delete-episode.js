module.exports = async function (strapi, episode) {
  await strapi.query('episode').delete({id: episode.id});
};
