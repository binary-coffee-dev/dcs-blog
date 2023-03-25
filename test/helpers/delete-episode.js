module.exports = async function (strapi, episode) {
  await strapi.models.episode.deleteOne({_id: episode.id});
};
