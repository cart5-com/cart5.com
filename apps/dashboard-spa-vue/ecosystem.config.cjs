// ecosystem.config.js
module.exports = {
    apps: [{
        name: "dashboard-spa-vue",
        script: "node_modules/http-server/bin/http-server",
        args: "dist -s -p 3004 -a 0.0.0.0 -d false --log-ip false --gzip --brotli --proxy http://127.0.0.1:3004? -c 120",
        instances: 1,
        watch: false,
        max_memory_restart: '150M',
    }]
}