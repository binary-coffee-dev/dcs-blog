const randomName = require('./random-name');

module.exports = async function ({strapi, roleType = 'authenticated', provider = undefined}) {
  const role = await strapi.query('plugin::users-permissions.role').findOne({where: {type: roleType}});
  return await strapi.query('plugin::users-permissions.user').create({
    data: {
      username: randomName(),
      confirmed: true,
      role: role,
      name: randomName(),
      avatarUrl: '/some/eso.jpg',
      providers: (provider ? [provider.id] : undefined)
    },
    populate: ['role', 'avatar']
  });
};
