import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  AUTH_PROVIDER: z.enum(["clerk", "authjs"]).default("clerk"),
  CLERK_SECRET_KEY: z.string().optional(),
  CLERK_WEBHOOK_SECRET: z.string().optional(),
  STORAGE_DRIVER: z.enum(["local", "s3", "supabase"]).default("local"),
  S3_REGION: z.string().default("us-east-1"),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  S3_PUBLIC_CDN_URL: z.string().url().optional(),
  MEDIA_WORKDIR: z.string().default(".aurora/media"),
  FFMPEG_PATH: z.string().default("ffmpeg"),
  FFPROBE_PATH: z.string().default("ffprobe"),
  YT_DLP_PATH: z.string().default("yt-dlp"),
  JWT_ISSUER: z.string().default("aurora"),
  API_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(120),
  API_RATE_LIMIT_WINDOW: z.string().default("1 minute"),
});

export type AuroraEnv = z.infer<typeof envSchema>;

let cachedEnv: AuroraEnv | null = null;

export function getEnv(source: NodeJS.ProcessEnv = process.env): AuroraEnv {
  if (!cachedEnv) {
    cachedEnv = envSchema.parse(source);
  }

  return cachedEnv;
}

export function resetEnvCache() {
  cachedEnv = null;
}
