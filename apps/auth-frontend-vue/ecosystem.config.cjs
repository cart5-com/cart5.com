// ecosystem.config.js
module.exports = {
    apps: [{
        name: "auth-frontend-vue",
        script: "node_modules/http-server/bin/http-server",
        args: "dist -s -p 3001 -a 0.0.0.0 -d false --log-ip false --gzip --brotli --proxy http://127.0.0.1:3001? -c 120",
        watch: false,
        // max_memory_restart: '150M',
    }]
}