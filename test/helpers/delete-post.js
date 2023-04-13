module.exports = async (strapi) => {
  const db = strapi.connections.default;
  return db.raw('DELETE FROM post;');
};
