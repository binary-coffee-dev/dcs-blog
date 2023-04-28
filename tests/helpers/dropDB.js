module.exports = async function (strapi) {
  const fs = require('fs');
  const filename = strapi.db.config.connection.connection.filename;
  if (fs.existsSync(filename)) {
    fs.unlinkSync(filename);
  }
};
