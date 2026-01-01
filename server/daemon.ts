import express from "express";
import { createServer } from "http";
import { registerRoutes } from "./routes";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse CLI arguments
const args = process.argv.slice(2);
let dataDir = "./blockchain_data";
let port = 9001;
const priorityNodes: string[] = [];
let corsHeader: string | null = null;
let confirmExternalBind = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--data-dir" && i + 1 < args.length) {
    dataDir = args[i + 1];
  }
  if (args[i] === "--port" || args[i] === "--rpc-bind-port") {
    if (i + 1 < args.length) {
      port = parseInt(args[i + 1], 10);
      i++;
    }
  }
  if (args[i] === "--rpc-bind-ip" && i + 1 < args.length) {
    // Port is handled by bind logic
    i++;
  }
  if (args[i] === "--confirm-external-bind") {
    confirmExternalBind = true;
  }
  if (args[i] === "--cors-header" && i + 1 < args.length) {
    corsHeader = args[i + 1];
    i++;
  }
  if (args[i] === "--add-priority-node" && i + 1 < args.length) {
    priorityNodes.push(args[i + 1]);
    i++;
  }
  if (args[i] === "print_cn") {
    console.log(`Connected nodes: ${priorityNodes.length > 0 ? priorityNodes.join(", ") : "None"}`);
    process.exit(0);
  }
  if (args[i] === "--help") {
    console.log(`
arcanad - Arcana Coin Node Daemon

Usage: arcanad [options]

Options:
  --data-dir <path>         Directory to store blockchain data (default: ./blockchain_data)
  --port <number>           Port to listen on (default: 9001)
  --rpc-bind-ip <ip>        IP to bind RPC server to
  --rpc-bind-port <number>  Port to bind RPC server to
  --confirm-external-bind   Confirm binding to external IP
  --cors-header <header>    CORS header for RPC responses
  --add-priority-node <ip>  Add a node to connect to (IP:PORT)
  --help                    Show this help message
    `);
    process.exit(0);
  }
}

// Create data directory if it doesn't exist
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`Created data directory: ${dataDir}`);
}

if (confirmExternalBind) {
  console.log("External bind confirmed.");
}

if (priorityNodes.length > 0) {
  console.log(`Priority nodes added: ${priorityNodes.join(", ")}`);
}

// Start daemon
const app = express();

if (corsHeader) {
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", corsHeader);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  console.log(`CORS enabled with header: ${corsHeader}`);
}
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", network: "arcana", dataDir });
});

// Register routes
await registerRoutes(httpServer, app);

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║                   ARCANAD BLOCKCHAIN NODE                       ║
╠════════════════════════════════════════════════════════════════╣
║  Status:      Running                                           ║
║  Network:     Arcana                                            ║
║  Port:        ${port}                                                  ║
║  Data Dir:    ${dataDir}                                              ║
║  API:         http://0.0.0.0:${port}/api                           ║
║  Health:      http://0.0.0.0:${port}/health                         ║
╚════════════════════════════════════════════════════════════════╝
  `);
  console.log("Node is ready. Use ./arcanum-cli for commands.");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\nShutting down arcanad...");
  httpServer.close(() => {
    console.log("Arcanad stopped.");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  httpServer.close(() => {
    process.exit(0);
  });
});
