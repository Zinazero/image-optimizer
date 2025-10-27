module.exports = {
  apps: [
    {
      name: "image-optimizer",
      script: "dist/server.js",
      instances: 1,               // single instance is enough
      autorestart: true,          // auto-restart if it crashes
      watch: false,               // disable watching in production
      max_memory_restart: "200M", // restart if memory usage grows too large
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
