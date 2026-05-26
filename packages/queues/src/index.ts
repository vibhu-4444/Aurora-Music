import { Queue, QueueEvents } from "bullmq";
import IORedis from "ioredis";
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

let redis: IORedis | null = null;

export function getRedisConnection() {
  if (!redis) {
    redis = new IORedis(getEnv().REDIS_URL, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });
  }

  return redis;
}

export function createImportQueue() {
  return new Queue<ImportJobData>(queueNames.imports, {
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
