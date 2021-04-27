const randomName = require('./random-name');

module.exports = async function ({strapi, roleType = 'authenticated', provider = undefined}) {
  const role = await strapi.plugins['users-permissions'].models.role.findOne({type: roleType});
  return await strapi.plugins['users-permissions'].models.user.create({
    username: randomName(),
    confirmed: true,
    role: role.id,
    name: randomName(),
    avatarUrl: '/some/eso.jpg',
    providers: [provider]
  });
};
