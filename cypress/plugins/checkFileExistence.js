/*
    https://github.com/cypress-io/cypress/issues/1402#issuecomment-403320720
*/

const fs = require("fs");

module.exports = {
  checkFileExistence: relativeFilePath => fs.existsSync(relativeFilePath)
};
