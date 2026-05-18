/*
 * Cyber_Folks / Passenger startup file for Next.js.
 * Set this file as "Application startup file" in the hosting panel.
 */
const http = require('http');
const { parse } = require('url');
const next = require('next');
const { loadEnvConfig } = require('@next/env');

const dev = process.env.NODE_ENV !== 'production';
loadEnvConfig(__dirname, dev);
const hostname = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 4000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
    .prepare()
    .then(() => {
        const server = http.createServer(async (req, res) => {
            try {
                const parsedUrl = parse(req.url || '/', true);
                await handle(req, res, parsedUrl);
            } catch (err) {
                console.error('Startup server error:', err);
                res.statusCode = 500;
                res.end('Internal server error');
            }
        });

        server.listen(port, hostname, () => {
            console.log(`> Next.js ready on http://${hostname}:${port}`);
        });

        const shutdown = () => {
            server.close(() => process.exit(0));
        };

        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);
    })
    .catch((err) => {
        console.error('Failed to start Next.js app:', err);
        process.exit(1);
    });
