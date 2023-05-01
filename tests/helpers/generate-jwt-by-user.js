module.exports = (strapi, user) => {
  return strapi.service('plugin::users-permissions.jwt').issue({id: user.id});
};
