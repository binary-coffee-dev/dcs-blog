const fs = require('fs');

module.exports = {
  removeFile(path) {
    try {
      fs.unlinkSync(path);
    } catch (err) {
      console.log(err);
    }
  },

  createFile(path) {
    fs.writeFileSync(path, 'temporal data');
  }
};
