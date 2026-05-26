import { Queue, QueueEvents } from "bullmq";
import { getEnv } from "@aurora/config";
import type { CreateImportRequest } from "@aurora/types";

export const queueNames = {
  imports: "aurora.imports",
  mediaCleanup: "aurora.media-cleanup",
  analytics: "aurora.analytics",
  recommendations: "aurora.recommendations",
} as const;

export interface ImportJobData extends CreateImportRequest {
  importId: string;
  userId: string;
}

export function getRedisConnection() {
  const url = new URL(getEnv().REDIS_URL);

  return {
    host: url.hostname,
    port: Number(url.port || 6379),
    username: url.username || undefined,
    password: url.password || undefined,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    tls: url.protocol === "rediss:" ? {} : undefined,
  };
}

export function createImportQueue() {
  return new Queue<ImportJobData, unknown, "extract-audio">(queueNames.imports, {
    connection: getRedisConnection(),
    defaultJobOptions: {
      attempts: 3,
      backoff: { type: "exponential", delay: 20_000 },
      removeOnComplete: { age: 60 * 60 * 24, count: 1_000 },
      removeOnFail: { age: 60 * 60 * 24 * 7 },
    },
  });
}

export function createImportQueueEvents() {
  return new QueueEvents(queueNames.imports, {
    connection: getRedisConnection(),
  });
}
