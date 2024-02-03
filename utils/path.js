const path = require('path');
// To get the path of the main folder which called the app
module.exports = path.dirname(require.main.filename);