module.exports = async function (strapi) {
  for (let model of strapi.db.models) {
    await model[1].db.dropDatabase();
    break;
  }
};
