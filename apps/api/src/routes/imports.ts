import type { FastifyInstance } from "fastify";
import { createImportQueue } from "@aurora/queues";
import { getPrisma } from "@aurora/database";
import { z } from "zod";
import { requireUser } from "../plugins/auth.js";
import { detectSourcePlatform } from "../services/source-detector.js";

const createImportSchema = z.object({
  url: z.string().url(),
  playlistId: z.string().optional(),
  preferredQuality: z.enum(["preview", "standard", "lossless"]).default("standard"),
});

const importSourceMap = {
  youtube: "YOUTUBE",
  instagram: "INSTAGRAM",
  tiktok: "TIKTOK",
  facebook: "FACEBOOK",
  x: "X",
  direct: "DIRECT",
  unknown: "UNKNOWN",
} as const;

export async function registerImportRoutes(server: FastifyInstance) {
  const queue = createImportQueue();

  server.post("/v1/imports", async (request, reply) => {
    const user = await requireUser(request);
    const body = createImportSchema.parse(request.body);
    const source = detectSourcePlatform(body.url);
    const prisma = getPrisma();

    const audioImport = await prisma.import.create({
      data: {
        userId: user.id,
        source: importSourceMap[source],
        sourceUrl: body.url,
        status: "QUEUED",
      },
    });

    const job = await queue.add("extract-audio", {
      importId: audioImport.id,
      userId: user.id,
      ...body,
    });

    await prisma.processingJob.create({
      data: {
        importId: audioImport.id,
        queueName: "aurora.imports",
        externalJobId: job.id,
        payload: body,
      },
    });

    return reply.code(202).send({
      importId: audioImport.id,
      jobId: job.id,
      source,
      status: "queued",
    });
  });

  server.get("/v1/imports/:id", async (request) => {
    const user = await requireUser(request);
    const params = z.object({ id: z.string() }).parse(request.params);

    return getPrisma().import.findFirstOrThrow({
      where: { id: params.id, userId: user.id },
      include: { track: true, jobs: { orderBy: { createdAt: "desc" }, take: 5 } },
    });
  });
}
