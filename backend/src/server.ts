import Fastify from "fastify";
import cors from "@fastify/cors";
import sensible from "@fastify/sensible";
import { config } from "./config/index.js";
import { apiRoutes } from "./routes/apiRoutes.js";
import { scheduledTasks } from "./jobs/scheduledTasks.js";

export function buildServer() {
  const server = Fastify({
    logger: {
      level: config.LOG_LEVEL,
      transport:
        config.NODE_ENV === "development"
          ? {
              target: "pino/file",
              options: { destination: 1 },
            }
          : undefined,
    },
  });

  server.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  server.register(sensible);

  server.register(apiRoutes, { prefix: "/api/v1" });

  server.setErrorHandler((error, request, reply) => {
    server.log.error(error);
    reply.status(error.statusCode || 500).send({
      error: error.name || "InternalServerError",
      message: error.message || "An unexpected environmental calculation error occurred",
      statusCode: error.statusCode || 500,
    });
  });

  return server;
}

async function start() {
  const server = buildServer();

  try {
    await server.listen({ port: config.PORT, host: config.HOST });
    console.log(`[AeroWard API] Fastify server running on http://${config.HOST}:${config.PORT}`);

    if (config.ENABLE_SCHEDULED_INGESTION) {
      scheduledTasks.start();
      console.log("[AeroWard API] Scheduled atmospheric ingestion pipelines initialized.");
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  const signals = ["SIGINT", "SIGTERM"];
  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`[AeroWard API] Received ${signal}, shutting down gracefully...`);
      scheduledTasks.stop();
      await server.close();
      process.exit(0);
    });
  }
}

const isTesting =
  process.env.NODE_ENV === "test" ||
  process.env.npm_lifecycle_event === "test" ||
  process.execArgv.some((a) => a.includes("test")) ||
  process.argv.some((a) => a.includes("test"));

if (!isTesting) {
  start();
}
