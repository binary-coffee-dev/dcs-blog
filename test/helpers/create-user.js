function randomName(value) {
  return [...Array(value || 20).keys()]
    .map(() => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 'abcdefghijklmnopqrstuvwxyz'.length)])
    .reduce((p, v) => p + v, '');
}

module.exports = async function ({strapi, roleType = 'authenticated'}) {
  const role = await strapi.plugins['users-permissions'].models.role.findOne({type: roleType});
  return await strapi.plugins['users-permissions'].models.user.create({
    username: randomName(),
    confirmed: true,
    role: role.id,
    name: randomName()
  });
};
