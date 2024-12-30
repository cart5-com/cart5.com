// var penv = require('path').join(__dirname, "./.env");
// var envConfig = require('dotenv').config({ path: penv });
const path = require('path');
require('dotenv').config({
    path: path.join(__dirname, '../../.env.production')
});

module.exports = {
    apps: [
        {
            name: "auth-api-hono",
            script: "./dist/index.js",

            instances: 0,
            // // https://www.digitalocean.com/community/tutorials/how-to-scale-node-js-applications-with-clustering#step-5-using-pm2-for-clustering
            exec_mode: "cluster",
            max_memory_restart: '250M',
            kill_timeout: 5000,
            wait_ready: true,

            // // cron_restart: "0 */6 * * *", // every 6 hours
            // env: Object.assign({}, envConfig, {
            //     "HOST": "0.0.0.0",
            //     "PORT": "3002"
            // }),
        },
    ],
}