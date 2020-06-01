module.exports = async (strapi, user) => {
  await strapi.plugins['users-permissions'].models.user.deleteOne({_id: user.id});
};
