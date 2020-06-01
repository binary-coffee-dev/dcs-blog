module.exports = async (strapi, post) => {
  await strapi.models.post.deleteOne({_id: post.id});
};
