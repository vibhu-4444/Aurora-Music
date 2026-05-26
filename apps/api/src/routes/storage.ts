import type { FastifyInstance } from "fastify";
import { createSignedUploadUrl } from "@aurora/storage";
import { z } from "zod";
import { requireUser } from "../plugins/auth.js";

const uploadSchema = z.object({
  filename: z.string().min(1).max(180),
  contentType: z.string().regex(/^(audio|image|video)\//),
  kind: z.enum(["audio", "thumbnail", "waveform", "playlist-cover", "preview"]),
});

export async function registerStorageRoutes(server: FastifyInstance) {
  server.post("/v1/storage/uploads", async (request) => {
    const user = await requireUser(request);
    const body = uploadSchema.parse(request.body);
    const safeName = body.filename.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
    const key = `users/${user.id}/${body.kind}/${crypto.randomUUID()}-${safeName}`;

    return {
      key,
      uploadUrl: await createSignedUploadUrl({
        key,
        contentType: body.contentType,
        kind: body.kind,
      }),
    };
  });
}
