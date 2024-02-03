const fs = require("fs");

module.exports = (path) => {
  if (fs.existsSync(path)) {
    return fs.unlink(path, (err) => {
      if (err) {
        throw new Error(err);
      }
    });
  } else {
    return;
  }
};
