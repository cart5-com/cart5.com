// var penv = require('path').join(__dirname, "./.env");
// var envConfig = require('dotenv').config({ path: penv });
const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../../.env.production')
});

module.exports = {
    apps: [
        {
            name: "web-store-ssr-astro",
            script: "./dist/server/entry.mjs",
            // instances: 0,
            // // https://www.digitalocean.com/community/tutorials/how-to-scale-node-js-applications-with-clustering#step-5-using-pm2-for-clustering
            // exec_mode: "cluster",
            // max_memory_restart: '150M',
            // kill_timeout: 5000,
            // wait_ready: true,

            // // cron_restart: "0 */6 * * *", // every 6 hours
            env: {
                "HOST": "0.0.0.0",
                "PORT": "3002"
            },
        },
    ],
}