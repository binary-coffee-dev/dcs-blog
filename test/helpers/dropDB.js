module.exports = async function (strapi) {
  const fs = require('fs');
  const db = strapi.connections.default;
  fs.unlinkSync(db.client.config.connection.filename);
};
