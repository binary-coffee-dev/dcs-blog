module.exports = async (strapi, id) => {
  return await strapi.query('api::post.post').findOne({where: {id}});
};
