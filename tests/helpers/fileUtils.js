const fs = require('fs');

module.exports = {
  removeFile(path) {
    if (fs.existsSync(path)) {
      fs.unlinkSync(path);
    }
  },

  createFile(path) {
    fs.writeFileSync(path, 'temporal data');
  }
};
