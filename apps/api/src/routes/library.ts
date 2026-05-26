import type { FastifyInstance } from "fastify";
import { getPrisma } from "@aurora/database";
import { z } from "zod";
import { requireUser } from "../plugins/auth.js";

export async function registerLibraryRoutes(server: FastifyInstance) {
  server.get("/v1/library/tracks", async (request) => {
    const user = await requireUser(request);
    const query = z.object({ q: z.string().optional(), take: z.coerce.number().min(1).max(100).default(40) }).parse(request.query);

    return getPrisma().track.findMany({
      where: {
        ownerId: user.id,
        deletedAt: null,
        title: query.q ? { contains: query.q, mode: "insensitive" } : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: query.take,
      include: { artists: { include: { artist: true } }, assets: true },
    });
  });

  server.get("/v1/search", async (request) => {
    const user = await requireUser(request);
    const query = z.object({ q: z.string().min(1).max(120) }).parse(request.query);
    const prisma = getPrisma();

    await prisma.recentSearch.create({
      data: { userId: user.id, query: query.q },
    });

    const [tracks, playlists] = await Promise.all([
      prisma.track.findMany({
        where: { ownerId: user.id, deletedAt: null, title: { contains: query.q, mode: "insensitive" } },
        take: 20,
      }),
      prisma.playlist.findMany({
        where: { ownerId: user.id, deletedAt: null, title: { contains: query.q, mode: "insensitive" } },
        take: 20,
      }),
    ]);

    return { tracks, playlists };
  });
}
