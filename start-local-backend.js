import { spawn } from 'child_process';
import http from 'http';
import fs from 'fs';

const functions = [
    { name: 'adk-course-creator', port: 8081 },
    { name: 'ai-subject-wizard', port: 8082 },
    { name: 'discover-resources', port: 8083 },
    { name: 'gemini-api', port: 8084 },
    { name: 'learning-path-ai', port: 8085 },
    { name: 'prompt-engineering-ai', port: 8086 },
    { name: 'vertex-ai', port: 8087 }
];

console.log('Starting local backend functions...');

const childProcesses = [];

functions.forEach(({ name, port }) => {
    if (fs.existsSync(`functions/${name}/index.js`)) {
        const child = spawn('node', [`functions/${name}/index.js`], {
            env: { ...process.env, PORT: port },
            stdio: 'inherit'
        });
        
        child.on('error', (err) => {
            console.error(`Failed to start ${name}:`, err);
        });

        childProcesses.push(child);
    } else {
        console.warn(`Warning: Directory functions/${name} not found. Skipping.`);
    }
});

// Cleanup child processes on exit
process.on('SIGINT', () => {
    console.log('\nShutting down local functions...');
    childProcesses.forEach(child => child.kill('SIGINT'));
    process.exit();
});

// Create a simple reverse proxy to mimic Supabase Edge Functions URL structure
const proxyPort = 54321;
const server = http.createServer((req, res) => {
    // Add CORS headers globally
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization,apikey');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    const match = req.url.match(/^\/functions\/v1\/([^/?]+)(.*)/);
    if (!match) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }

    const funcName = match[1];
    const targetPath = match[2] || '/';
    const targetFunc = functions.find(f => f.name === funcName);

    if (!targetFunc) {
        res.writeHead(404);
        res.end(`Function ${funcName} not found locally.`);
        return;
    }

    // Proxy the request to the specific function's local port
    const options = {
        hostname: 'localhost',
        port: targetFunc.port,
        path: targetPath,
        method: req.method,
        headers: { ...req.headers, host: `localhost:${targetFunc.port}` }
    };

    const proxyReq = http.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res, { end: true });
    });

    req.pipe(proxyReq, { end: true });

    proxyReq.on('error', (err) => {
        console.error(`Proxy error for ${funcName}:`, err.message);
        res.writeHead(502);
        res.end('Bad gateway');
    });
});

server.listen(proxyPort, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 LOCAL BACKEND MOCK SERVER RUNNING ON PORT ${proxyPort}`);
    console.log(`======================================================`);
    console.log(`\nTo QA both the frontend and backend locally:`);
    console.log(`1. Temporarily change VITE_SUPABASE_URL in your .env file to:`);
    console.log(`   VITE_SUPABASE_URL="http://localhost:54321"`);
    console.log(`2. Open a new terminal and run: npm run dev`);
    console.log(`\nPress Ctrl+C to stop all local functions.\n`);
});
