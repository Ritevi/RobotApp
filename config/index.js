const nconf = require('nconf');
const path = require('path');

let configStr = '';
if (process.env.ENV === 'test') {
  configStr = 'test.json';
} else if (process.env.ENV === 'dev') {
  configStr = 'config.json';
}

nconf.argv()
  .env()
  .file({ file: path.join(__dirname, configStr) });

module.exports = nconf;
