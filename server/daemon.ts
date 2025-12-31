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

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--data-dir" && i + 1 < args.length) {
    dataDir = args[i + 1];
  }
  if (args[i] === "--port" && i + 1 < args.length) {
    port = parseInt(args[i + 1], 10);
  }
  if (args[i] === "--add-priority-node" && i + 1 < args.length) {
    priorityNodes.push(args[i + 1]);
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

if (priorityNodes.length > 0) {
  console.log(`Priority nodes added: ${priorityNodes.join(", ")}`);
}

// Start daemon
const app = express();
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
