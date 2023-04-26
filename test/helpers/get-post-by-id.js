module.exports = async (strapi, id) => {
  return await strapi.query('post').findOne({id});
};
