module.exports = {
  apps: [{
    name: "mygpupower",
    script: "./dist/server/index.js",
    env: {
      NODE_ENV: "production",
      PORT: 3000,
      DB_SSL: "false"
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    merge_logs: true
  }]
};