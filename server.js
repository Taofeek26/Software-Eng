const express = require('express');
const cluster = require('node:cluster');
const os = require('node:os');

const app = express();
const PORT = process.env.PORT || 3000;
const numCPUs = os.cpus().length;

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] Worker ${process.pid} received ${req.method} ${req.url}`);
    next();
});

app.get('/', (req, res) => {
    res.send(`Hello from Worker ${process.pid}! This is a fast response.`);
});

// Simulate a slow I/O-bound operation (e.g., database query, external API call)
app.get('/slow', (req, res) => {
    const delay = 5000; // 5 seconds
    console.log(`Worker ${process.pid} starting slow operation for ${delay/1000}s...`);
    setTimeout(() => {
        console.log(`Worker ${process.pid} finished slow operation.`);
        res.send(`Slow response from Worker ${process.pid} after ${delay/1000} seconds. The server was not blocked!`);
    }, delay);
});

// Simulate a CPU-intensive task (for demonstration purposes, not ideal in main thread)
// In a real app, this would be offloaded to a worker thread or separate service.
app.get('/cpu-intensive', (req, res) => {
    console.log(`Worker ${process.pid} starting CPU-intensive task...`);
    const startTime = Date.now();
    // Example: A loop that does some work
    // For demonstration, keep this short or it WILL block the event loop for this worker.
    // A more realistic CPU task would take much longer and should be offloaded.
    let result = 0;
    for (let i = 0; i < 1e7; i++) { // Reduced loop for quicker demo
        result += Math.sqrt(i) * Math.sin(i);
    }
    const duration = Date.now() - startTime;
    console.log(`Worker ${process.pid} finished CPU-intensive task in ${duration}ms.`);
    res.send(`CPU-intensive task completed by Worker ${process.pid} in ${duration}ms. Result (not meaningful): ${result}`);
});

// --- Clustering ---
// This section demonstrates horizontal scaling using the cluster module.
// To run without clustering for a simpler single-process demo, comment out the
// `if (cluster.isPrimary)` block and the `else` block, just keeping the app.listen.

if (process.env.ENABLE_CLUSTER === 'true' && cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);

    // Fork workers for each CPU core.
    console.log(`Forking ${numCPUs} workers...`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Forking a new one...`);
        cluster.fork(); // Replace the dead worker
    });

    // Note: The primary process does not run app.listen() itself.
    // It only manages the worker processes.

} else {
    // Workers can share any TCP connection
    // In this case, it is an HTTP server
    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started. Server listening on http://localhost:${PORT}`);
        if (process.env.ENABLE_CLUSTER === 'true') {
            console.log(`This worker is part of a cluster.`);
        } else {
            console.log(`Running in single process mode.`);
        }
    });
}

// To run in single process mode: node server.js
// To run in cluster mode: ENABLE_CLUSTER=true node server.js