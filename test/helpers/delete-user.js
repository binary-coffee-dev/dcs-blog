module.exports = async (strapi, user) => {
  await strapi.query('user', 'users-permissions').delete({id: user.id});
};
