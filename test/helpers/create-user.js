const randomName = require('./random-name');

module.exports = async function ({strapi, roleType = 'authenticated', provider = undefined}) {
  // const b = await strapi.plugins['users-permissions'].services.userspermissions.getRoles();
  //
  // const a = await strapi.plugins['users-permissions'].services.userspermissions.getRole({type: 'authenticated'});
  // console.log()
  const role = await strapi.query('role', 'users-permissions').findOne({type: roleType});
  return await strapi.query('role', 'users-permissions').create({
    username: randomName(),
    confirmed: true,
    role: role,
    name: randomName(),
    avatarUrl: '/some/eso.jpg',
    providers: [provider]
  });
};
