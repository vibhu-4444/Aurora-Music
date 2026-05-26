import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { execa } from "execa";
import { getEnv } from "@aurora/config";

function processedWorkdir(importId: string) {
  return path.join(getEnv().MEDIA_WORKDIR, "processed", importId);
}

export async function normalizeAndTranscode(inputPath: string, importId: string) {
  const dir = processedWorkdir(importId);
  await mkdir(dir, { recursive: true });
  const outputPath = path.join(dir, "stream.mp3");

  await execa(
    getEnv().FFMPEG_PATH,
    [
      "-y",
      "-i",
      inputPath,
      "-af",
      "loudnorm=I=-14:TP=-1.5:LRA=11",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      "320k",
      outputPath,
    ],
    { timeout: 1000 * 60 * 60 },
  );

  const stats = await stat(outputPath);
  return { path: outputPath, bytes: stats.size };
}

export async function generateWaveform(inputPath: string, importId: string) {
  const dir = processedWorkdir(importId);
  await mkdir(dir, { recursive: true });
  const outputPath = path.join(dir, "waveform.json");

  // This is a production boundary: replace with audiowaveform or a native analyzer
  // when deploying media workers. The JSON shape is stable for the API/UI.
  await writeFile(outputPath, JSON.stringify({ version: 1, peaks: [], source: inputPath }));
  const stats = await stat(outputPath);
  return { path: outputPath, bytes: stats.size };
}
