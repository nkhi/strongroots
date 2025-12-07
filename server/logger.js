const fs = require('fs');
const path = require('path');
const logFile = path.join(__dirname, 'server.log');

function logToFile(msg) {
  try {
    fs.appendFileSync(logFile, msg + '\n');
  } catch (e) {
    // ignore logging errors
  }
}

module.exports = { logToFile };
