import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import multipart from "@fastify/multipart";
import rateLimit from "@fastify/rate-limit";
import sensible from "@fastify/sensible";
import Fastify from "fastify";
import { getEnv } from "@aurora/config";
import { registerHealthRoutes } from "./routes/health.js";
import { registerImportRoutes } from "./routes/imports.js";
import { registerLibraryRoutes } from "./routes/library.js";
import { registerStorageRoutes } from "./routes/storage.js";
import { registerStreamRoutes } from "./routes/streaming.js";

export async function buildServer() {
  const env = getEnv();
  const server = Fastify({
    logger: {
      level: env.NODE_ENV === "development" ? "debug" : "info",
      redact: ["req.headers.authorization", "req.headers.cookie"],
    },
    bodyLimit: 8 * 1024 * 1024,
  });

  await server.register(helmet);
  await server.register(cors, {
    origin: [env.APP_URL],
    credentials: true,
  });
  await server.register(sensible);
  await server.register(rateLimit, {
    max: env.API_RATE_LIMIT_MAX,
    timeWindow: env.API_RATE_LIMIT_WINDOW,
  });
  await server.register(multipart, {
    limits: {
      fileSize: 1024 * 1024 * 1024,
      files: 1,
    },
  });

  await registerHealthRoutes(server);
  await registerImportRoutes(server);
  await registerLibraryRoutes(server);
  await registerStorageRoutes(server);
  await registerStreamRoutes(server);

  return server;
}
