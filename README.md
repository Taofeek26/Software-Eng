# Node.js Scalability and Concurrency Demo

This project demonstrates Node.js's ability to handle concurrent connections efficiently due to its non-blocking I/O model and how it can be scaled using the `cluster` module.

## Files

*   `server.js`: The main application file containing the Express.js server.
*   `package.json`: Project metadata and dependencies.
*   `README.md`: This file.

## Implementation Details

The `server.js` file sets up a simple Express application with three main endpoints:

1.  **`/` (Root):**
    *   Responds immediately with a "Hello" message.
    *   Demonstrates a fast, non-blocking request.

2.  **`/slow`:**
    *   Simulates a slow, I/O-bound operation (like a database query or an external API call) using `setTimeout` for 5 seconds.
    *   Crucially, while one request to `/slow` is "waiting" for the `setTimeout` to complete, the Node.js server is **not blocked**. It can continue to serve other requests, including other requests to `/slow` or `/`. This showcases the non-blocking nature of Node.js.

3.  **`/cpu-intensive`:**
    *   Simulates a CPU-bound task by performing a loop of calculations.
    *   **Important Note:** If this task is long enough and run in the main event loop (as it is in this simple example within a worker), it *will* block the event loop for *that specific worker process*. This is to illustrate the difference between I/O-bound and CPU-bound tasks in Node.js. In a real-world scenario, truly CPU-intensive tasks should be offloaded to `worker_threads`, child processes, or a separate microservice to avoid blocking the event loop responsible for handling network requests. The loop count `1e7` is kept relatively low here for a quicker demo.

### How it Showcases Node.js's Scalability & Concurrency

*   **Non-Blocking I/O (Concurrency):** The `/slow` endpoint is key. Even if multiple requests hit `/slow` simultaneously, or if requests to `/` come in while `/slow` is processing, the server remains responsive. This is because `setTimeout` (like actual file I/O or network calls) is non-blocking. Node.js registers the timer and moves on to handle other events. When the timer fires, its callback is placed on the event queue and executed by the event loop.
*   **Horizontal Scaling (Clustering):** The `server.js` includes code to utilize the `cluster` module. When run with `ENABLE_CLUSTER=true node server.js`, the primary process will fork multiple worker processes (typically one per CPU core). Each worker runs its own instance of the Express app and its own event loop. The primary process then distributes incoming connections among these workers. This allows the application to take full advantage of multi-core processors, significantly increasing throughput and resilience. If one worker crashes, the primary process can restart it without affecting other workers.

## Instructions for Running the Application

1.  **Prerequisites:**
    *   Node.js (v16 or later recommended)
    *   npm (usually comes with Node.js)

2.  **Clone the repository (if applicable) or create the files.**

3.  **Navigate to the project directory:**
    ```bash
    cd node-scalability-demo
    ```

4.  **Install dependencies:**
    ```bash
    npm install
    ```

5.  **Run the application:**

    *   **Single Process Mode (No Clustering):**
        ```bash
        npm start
        # OR
        node server.js
        ```
        The server will start, typically on `http://localhost:3000`. You will see a log like: `Worker <PID> started. Server listening on http://localhost:3000`.

    *   **Cluster Mode (Multiple Worker Processes):**
        ```bash
        ENABLE_CLUSTER=true node server.js
        ```
        You will see logs for the primary process and then for each worker process starting up (e.g., `Primary <PID> is running`, `Forking <N> workers...`, `Worker <PID_worker1> started...`, `Worker <PID_worker2> started...`).

## Performance Metrics and Scalability Tests (Conceptual)

For this mini-project, we'll perform simple manual tests to observe concurrency. For more rigorous testing, tools like `Apache Bench (ab)`, `wrk`, `k6`, or `artillery` would be used.

### Manual Concurrency Test:

1.  **Start the server** (either in single or cluster mode).
2.  **Open multiple terminal windows or browser tabs.**

3.  **Scenario 1: Non-Blocking Behavior**
    *   In Terminal/Tab 1, make a request to the `/slow` endpoint:
        ```bash
        curl http://localhost:3000/slow
        ```
        This request will take 5 seconds to respond.
    *   *Immediately after* sending the first request, in Terminal/Tab 2, make a request to the root `/` endpoint:
        ```bash
        curl http://localhost:3000/
        ```
    *   **Observation:** The request in Terminal/Tab 2 should return almost instantly, even though the `/slow` request is still "processing". This demonstrates that Node.js is not blocked by the `setTimeout` in the `/slow` handler.
    *   You can also try sending multiple requests to `/slow` concurrently from different terminals. They will all start their 5-second "wait" roughly at the same time and finish around 5 seconds later, rather than one after the other sequentially.

4.  **Scenario 2: CPU-Intensive Behavior (within a single worker)**
    *   If running in **single process mode** OR if you manage to hit the **same worker in cluster mode** repeatedly:
    *   In Terminal/Tab 1, make a request to `/cpu-intensive`:
        ```bash
        curl http://localhost:3000/cpu-intensive
        ```
    *   *Immediately after*, in Terminal/Tab 2, try to hit `/`:
        ```bash
        curl http://localhost:3000/
        ```
    *   **Observation (Single Process / Same Worker):** The request to `/` might be delayed until the `/cpu-intensive` task on that worker completes, showing how a CPU-bound task *can* block the event loop for that specific worker.
    *   **Observation (Cluster Mode with different workers):** If the requests hit *different* workers in cluster mode, the `/` request should still be fast, as only one worker's event loop is busy. This highlights one benefit of clustering for CPU-bound tasks – isolation.

### Expected Output on Server Logs:

You'll see logs like:[TIMESTAMP] Worker <PID> received GET /slow
Worker <PID> starting slow operation for 5s...
[TIMESTAMP] Worker <PID> received GET /
Worker <PID> finished slow operation.

Notice how the second GET request to `/` is received and potentially processed *before* the "finished slow operation" log.

If using cluster mode, you'll see different PIDs for different workers handling requests.

### Further Scalability Considerations (Beyond this Demo):

*   **Load Balancers:** In a production environment with clustering, a load balancer (like Nginx, HAProxy, or a cloud provider's load balancer) would be placed in front of the Node.js cluster to distribute traffic.
*   **PM2:** A process manager like PM2 can simplify running Node.js applications in cluster mode, manage logging, monitor applications, and automatically restart them if they crash.
    *   Example with PM2: `pm2 start server.js -i max` (starts in cluster mode using max available CPUs).
*   **Worker Threads:** For truly CPU-intensive tasks *within* a single Node.js service that cannot be easily broken into a separate microservice, the `worker_threads` module is the recommended approach to avoid blocking the main event loop.
*   **Statelessness:** Designing applications to be stateless makes horizontal scaling easier, as any instance can handle any request. Session data, if needed, should be stored in an external store like Redis or a database.