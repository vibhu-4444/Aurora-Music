import type { Job } from "bullmq";
import type { Logger } from "pino";
import { getPrisma } from "@aurora/database";
import type { ImportJobData } from "@aurora/queues";
import { probeRemoteMedia, downloadAudio } from "../services/ytdlp.js";
import { generateWaveform, normalizeAndTranscode } from "../services/ffmpeg.js";

const statusMap = {
  fetching_metadata: "FETCHING_METADATA",
  downloading: "DOWNLOADING",
  extracting: "EXTRACTING",
  transcoding: "TRANSCODING",
  normalizing: "NORMALIZING",
  waveform: "WAVEFORM",
  storing: "STORING",
  completed: "COMPLETED",
  failed: "FAILED",
} as const;

async function updateImport(job: Job<ImportJobData>, status: keyof typeof statusMap, progress: number, message?: string) {
  await job.updateProgress(progress);
  await getPrisma().import.update({
    where: { id: job.data.importId },
    data: {
      status: statusMap[status],
      progress,
      failureMessage: status === "failed" ? message : undefined,
      completedAt: status === "completed" ? new Date() : undefined,
    },
  });
}

export async function processImportJob(job: Job<ImportJobData>, logger: Logger) {
  const prisma = getPrisma();
  logger.info({ importId: job.data.importId, url: job.data.url }, "Starting universal audio import");

  try {
    await updateImport(job, "fetching_metadata", 10);
    const metadata = await probeRemoteMedia(job.data.url);

    await prisma.import.update({
      where: { id: job.data.importId },
      data: {
        title: metadata.title,
        authorName: metadata.uploader,
        thumbnailUrl: metadata.thumbnail,
        durationMs: metadata.durationSeconds ? Math.round(metadata.durationSeconds * 1000) : undefined,
        rawMetadata: metadata.raw,
      },
    });

    await updateImport(job, "downloading", 25);
    const downloaded = await downloadAudio(job.data.url, job.data.importId);

    await updateImport(job, "transcoding", 50);
    const audio = await normalizeAndTranscode(downloaded.path, job.data.importId);

    await updateImport(job, "waveform", 70);
    const waveform = await generateWaveform(audio.path, job.data.importId);

    await updateImport(job, "storing", 85);
    const track = await prisma.track.create({
      data: {
        ownerId: job.data.userId,
        sourceImportId: job.data.importId,
        title: metadata.title ?? "Imported Track",
        slug: `${job.data.importId}-import`,
        durationMs: metadata.durationSeconds ? Math.round(metadata.durationSeconds * 1000) : undefined,
        waveformKey: waveform.path,
        assets: {
          create: [
            {
              kind: "AUDIO_STREAM",
              storageDriver: "local",
              key: audio.path,
              contentType: "audio/mpeg",
              byteSize: BigInt(audio.bytes),
            },
            {
              kind: "WAVEFORM",
              storageDriver: "local",
              key: waveform.path,
              contentType: "application/json",
              byteSize: BigInt(waveform.bytes),
            },
          ],
        },
      },
    });

    if (job.data.playlistId) {
      const count = await prisma.playlistTrack.count({ where: { playlistId: job.data.playlistId } });
      await prisma.playlistTrack.create({
        data: {
          playlistId: job.data.playlistId,
          trackId: track.id,
          position: count + 1,
          addedById: job.data.userId,
        },
      });
    }

    await updateImport(job, "completed", 100);
    return { trackId: track.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown import failure";
    await updateImport(job, "failed", 100, message);
    throw error;
  }
}
