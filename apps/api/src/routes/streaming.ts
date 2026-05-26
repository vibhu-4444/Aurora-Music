import type { FastifyInstance } from "fastify";
import { createSignedReadUrl } from "@aurora/storage";
import { getPrisma } from "@aurora/database";
import { z } from "zod";
import { requireUser } from "../plugins/auth.js";

export async function registerStreamRoutes(server: FastifyInstance) {
  server.get("/v1/tracks/:id/stream", async (request, reply) => {
    const user = await requireUser(request);
    const params = z.object({ id: z.string() }).parse(request.params);
    const track = await getPrisma().track.findFirstOrThrow({
      where: { id: params.id, ownerId: user.id, deletedAt: null },
      include: {
        assets: {
          where: { kind: "AUDIO_STREAM" },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const streamAsset = track.assets[0];

    if (!streamAsset) {
      throw server.httpErrors.notFound("No streamable audio asset exists for this track.");
    }

    return reply.redirect(await createSignedReadUrl(streamAsset.key, 60 * 15));
  });
}
