module.exports = async function (strapi) {
  await strapi.connections.default.connections[0].db.dropDatabase();
};
