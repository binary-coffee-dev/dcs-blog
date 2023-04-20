const randomName = require('./random-name');

module.exports = async function ({strapi, roleType = 'authenticated', provider = undefined}) {
  const role = await strapi.query('role', 'users-permissions').findOne({type: roleType});
  return await strapi.query('user', 'users-permissions').create({
    username: randomName(),
    confirmed: true,
    role: role,
    name: randomName(),
    avatarUrl: '/some/eso.jpg',
    providers: [provider.id]
  });
};
