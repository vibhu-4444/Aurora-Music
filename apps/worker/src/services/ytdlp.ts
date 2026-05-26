import { mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import { getEnv } from "@aurora/config";

export interface RemoteMediaMetadata {
  title?: string;
  uploader?: string;
  thumbnail?: string;
  durationSeconds?: number;
  raw: Record<string, unknown>;
}

function importWorkdir(importId: string) {
  return path.join(getEnv().MEDIA_WORKDIR, "imports", importId);
}

export async function probeRemoteMedia(url: string): Promise<RemoteMediaMetadata> {
  const { stdout } = await execa(getEnv().YT_DLP_PATH, ["--dump-json", "--no-playlist", url], {
    timeout: 60_000,
  });
  const raw = JSON.parse(stdout) as Record<string, unknown>;

  return {
    title: typeof raw.title === "string" ? raw.title : undefined,
    uploader: typeof raw.uploader === "string" ? raw.uploader : undefined,
    thumbnail: typeof raw.thumbnail === "string" ? raw.thumbnail : undefined,
    durationSeconds: typeof raw.duration === "number" ? raw.duration : undefined,
    raw,
  };
}

export async function downloadAudio(url: string, importId: string) {
  const dir = importWorkdir(importId);
  await mkdir(dir, { recursive: true });
  const outputTemplate = path.join(dir, "source.%(ext)s");

  await execa(
    getEnv().YT_DLP_PATH,
    ["--no-playlist", "--extract-audio", "--audio-format", "wav", "--audio-quality", "0", "-o", outputTemplate, url],
    { timeout: 1000 * 60 * 60 * 2 },
  );

  const outputPath = path.join(dir, "source.wav");
  const stats = await stat(outputPath);
  return { path: outputPath, bytes: stats.size };
}
