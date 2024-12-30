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
            // // cron_restart: "0 */6 * * *", // every 6 hours
            // env: Object.assign({}, envConfig, {
            //     "HOST": "0.0.0.0",
            //     "PORT": "3002"
            // }),
        },
    ],
}