import { spawn } from "node:child_process";

// On Render or production single-instance deployment:
// Next.js binds to process.env.PORT (Render's public assigned port, e.g. 10000 or default 3000)
// Fastify backend binds to local port 4000 (127.0.0.1)
// Next.js rewrites /api/v1/:path* to http://127.0.0.1:4000/api/v1/:path* seamlessly

const backendPort = process.env.BACKEND_PORT || "4000";
const publicPort = process.env.PORT || "3000";

console.log(`[AeroWard] Starting Fastify API backend on 127.0.0.1:${backendPort}...`);
const backend = spawn("node", ["backend/dist/server.js"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PORT: backendPort,
    HOST: "127.0.0.1",
  },
});

console.log(`[AeroWard] Starting Next.js frontend on public port ${publicPort}...`);
const frontend = spawn("npx", ["next", "start", "-p", publicPort], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PORT: publicPort,
  },
});

function shutdown(signal) {
  console.log(`\n[AeroWard] Received ${signal}, shutting down services...`);
  try {
    backend.kill();
  } catch {}
  try {
    frontend.kill();
  } catch {}
  process.exit(0);
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

backend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[AeroWard] Backend exited with error code ${code}`);
  }
});

frontend.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    console.error(`[AeroWard] Frontend exited with error code ${code}`);
  }
});
