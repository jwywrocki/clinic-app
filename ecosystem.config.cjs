module.exports = {
    apps: [
        {
            name: 'clinic-app',
            script: 'node_modules/.bin/next',
            args: 'start',
            cwd: __dirname,
            instances: 1, // single instance — required for node-cron scheduler
            exec_mode: 'fork',
            env: {
                PORT: 4000,
                NODE_ENV: 'production',
            },
            // Restart policy
            max_restarts: 10,
            min_uptime: '10s',
            restart_delay: 5000,
            autorestart: true,
            // Graceful shutdown
            kill_timeout: 10000,
            listen_timeout: 15000,
            // Memory guard — restart if exceeds 512 MB
            max_memory_restart: '512M',
            // Logging
            error_file: './logs/pm2-error.log',
            out_file: './logs/pm2-out.log',
            merge_logs: true,
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
        },
    ],
};
