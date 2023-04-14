module.exports = async function (strapi) {
  const fs = require('fs');
  const db = strapi.connections.default;
  const filename = db.client.config.connection.filename;
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
  }
};
