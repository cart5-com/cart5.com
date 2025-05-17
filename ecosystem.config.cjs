module.exports = {
    apps: [
        {
            name: "api-hono",
            cwd: "./apps/api-hono",
            script: "dotenvx run -f .env.production -- node ./dist/index.js",
            // https://www.digitalocean.com/community/tutorials/how-to-scale-node-js-applications-with-clustering#step-5-using-pm2-for-clustering
            // exec_mode: "cluster", // unable to use cluster mode because I use SSE in memory, also crons are in memory
            // instances: 0,
            max_memory_restart: '250M',
            kill_timeout: 20000,
            wait_ready: true,
        },
        {
            name: "auth-frontend-vue",
            cwd: "./apps/auth-frontend-vue",
            script: "node ./node_modules/http-server/bin/http-server dist -s -p 3001 -a 0.0.0.0 -d false --log-ip false --gzip --brotli --proxy http://127.0.0.1:3001? -c 120",
            // instances: 1,
            autorestart: true
        },
        {
            name: "dashboard-spa-vue",
            cwd: "./apps/dashboard-spa-vue",
            script: "node ./node_modules/http-server/bin/http-server dist -s -p 3004 -a 0.0.0.0 -d false --log-ip false --gzip --brotli --proxy http://127.0.0.1:3004? -c 120",
            // instances: 1,
            autorestart: true
        },
        {
            name: "orders-spa-vue",
            cwd: "./apps/orders-spa-vue",
            script: "node ./node_modules/http-server/bin/http-server dist -s -p 3005 -a 0.0.0.0 -d false --log-ip false --gzip --brotli --proxy http://127.0.0.1:3005? -c 120",
            // instances: 1,
            autorestart: true
        },
        {
            name: "web-astro",
            cwd: "./apps/web-astro",
            script: "dotenvx run -f .env.production -- node ./dist/server/entry.mjs",
            // https://www.digitalocean.com/community/tutorials/how-to-scale-node-js-applications-with-clustering#step-5-using-pm2-for-clustering
            instances: 0,
            exec_mode: "cluster",
            max_memory_restart: '150M',
            kill_timeout: 5000,
            // env: {
            //     HOST: "0.0.0.0",
            //     PORT: 3002
            // },
            // wait_ready: true, does not work with astro I could not find where to make `process.send('ready');`
        }
    ]
};