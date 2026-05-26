import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getEnv } from "@aurora/config";

export type StorageObjectKind = "audio" | "thumbnail" | "waveform" | "playlist-cover" | "preview";

export interface SignedUploadRequest {
  key: string;
  contentType: string;
  kind: StorageObjectKind;
}

let s3: S3Client | null = null;

function getS3Client() {
  const env = getEnv();

  if (!s3) {
    s3 = new S3Client({
      region: env.S3_REGION,
      credentials:
        env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY
          ? {
              accessKeyId: env.S3_ACCESS_KEY_ID,
              secretAccessKey: env.S3_SECRET_ACCESS_KEY,
            }
          : undefined,
    });
  }

  return s3;
}

export async function createSignedUploadUrl(input: SignedUploadRequest) {
  const env = getEnv();

  if (!env.S3_BUCKET) {
    throw new Error("S3_BUCKET is required for signed uploads.");
  }

  const command = new PutObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: input.key,
    ContentType: input.contentType,
    Metadata: { kind: input.kind },
  });

  return getSignedUrl(getS3Client(), command, { expiresIn: 60 * 10 });
}

export async function createSignedReadUrl(key: string, expiresIn = 60 * 15) {
  const env = getEnv();

  if (!env.S3_BUCKET) {
    throw new Error("S3_BUCKET is required for signed reads.");
  }

  return getSignedUrl(getS3Client(), new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }), { expiresIn });
}
