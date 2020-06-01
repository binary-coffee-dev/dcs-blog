module.exports = async (strapi, id) => {
  return await strapi.models.post.findOne({_id: id});
};
