module.exports = {
  apps: [{
    name: "api-hono",
    script: "./dist/index.js",
    // https://www.digitalocean.com/community/tutorials/how-to-scale-node-js-applications-with-clustering#step-5-using-pm2-for-clustering
    // exec_mode: "cluster",
    // instances: 0,
    max_memory_restart: '250M',
    kill_timeout: 18000,
    wait_ready: true,
  }]
};
