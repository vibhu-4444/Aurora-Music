import { Worker } from "bullmq";
import pino from "pino";
import { getRedisConnection, queueNames, type ImportJobData } from "@aurora/queues";
import { processImportJob } from "./processors/import-processor.js";

const logger = pino({ name: "aurora-worker" });

const worker = new Worker<ImportJobData>(
  queueNames.imports,
  async (job) => processImportJob(job, logger),
  {
    connection: getRedisConnection(),
    concurrency: Number(process.env.IMPORT_WORKER_CONCURRENCY ?? 3),
    limiter: {
      max: Number(process.env.IMPORT_WORKER_RATE_MAX ?? 20),
      duration: 60_000,
    },
  },
);

worker.on("completed", (job) => {
  logger.info({ jobId: job.id, importId: job.data.importId }, "Import job completed");
});

worker.on("failed", (job, error) => {
  logger.error({ jobId: job?.id, error }, "Import job failed");
});

process.on("SIGINT", async () => {
  logger.info("Stopping Aurora worker");
  await worker.close();
  process.exit(0);
});
