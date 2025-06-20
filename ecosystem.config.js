module.exports = {
  apps: [{
    name: 'onegateway-website',
    script: 'npm',
    args: 'run serve',
    cwd: '/www/wwwroot/onegateway.in',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/www/wwwroot/onegateway.in/logs/err.log',
    out_file: '/www/wwwroot/onegateway.in/logs/out.log',
    log_file: '/www/wwwroot/onegateway.in/logs/combined.log',
    time: true
  }]
};