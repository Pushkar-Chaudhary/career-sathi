const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const backendEntry = path.join(root, "Backend", "server.js");
const viteEntry = path.join(root, "Frontend", "node_modules", "vite", "bin", "vite.js");

for (const dependency of [backendEntry, viteEntry]) {
  if (!fs.existsSync(dependency)) {
    console.error(`Missing app file or dependencies: ${path.relative(root, dependency)}`);
    console.error("Install dependencies with npm ci in Backend/ and Frontend/, then run npm run dev again.");
    process.exit(1);
  }
}

console.log("Starting Career Sathi...");
console.log("Frontend: http://localhost:5173");
console.log("Backend:  http://localhost:3000");
console.log("Press Ctrl+C to stop both servers.\n");

const children = [
  spawn(process.execPath, [backendEntry], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  }),
  spawn(process.execPath, [viteEntry], {
    cwd: path.join(root, "Frontend"),
    env: process.env,
    stdio: "inherit",
  }),
];

let stopping = false;

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;

  for (const child of children) {
    if (child.exitCode === null && !child.killed) child.kill("SIGTERM");
  }

  process.exitCode = exitCode;
}

for (const child of children) {
  child.once("error", (error) => {
    console.error(`Could not start a server: ${error.message}`);
    stopAll(1);
  });

  child.once("exit", (code, signal) => {
    if (!stopping) {
      const exitCode = code ?? (signal ? 1 : 0);
      console.error(`A server stopped${signal ? ` (${signal})` : ` (code ${exitCode})`}. Stopping the other server.`);
      stopAll(exitCode);
    }
  });
}

process.once("SIGINT", () => stopAll(0));
process.once("SIGTERM", () => stopAll(0));
