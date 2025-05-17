const path = require('path');
const dotenvx = require('@dotenvx/dotenvx');
dotenvx.config({
  path: path.resolve(__dirname, '.env.production')
});

module.exports = {
  apps: [{
    name: "web-astro",
    script: "./dist/server/entry.mjs",
    // https://www.digitalocean.com/community/tutorials/how-to-scale-node-js-applications-with-clustering#step-5-using-pm2-for-clustering
    instances: 0,
    exec_mode: "cluster",
    max_memory_restart: '150M',
    kill_timeout: 5000,
    // wait_ready: true, does not work with astro I could not find where to make `process.send('ready');`
  }]
};