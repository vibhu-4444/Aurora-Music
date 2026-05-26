import { buildServer } from "./app.js";
import { getEnv } from "@aurora/config";

const env = getEnv();
const server = await buildServer();

const port = Number(process.env.PORT ?? 4000);

try {
  await server.listen({ host: "0.0.0.0", port });
  server.log.info({ port, env: env.NODE_ENV }, "Aurora API listening");
} catch (error) {
  server.log.error(error);
  process.exit(1);
}
