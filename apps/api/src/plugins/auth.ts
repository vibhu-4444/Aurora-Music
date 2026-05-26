import type { FastifyRequest } from "fastify";

export interface AuthenticatedUser {
  id: string;
  externalAuthId: string;
  role: "USER" | "ARTIST" | "ADMIN" | "SUPER_ADMIN";
}

export async function requireUser(request: FastifyRequest): Promise<AuthenticatedUser> {
  const externalAuthId = request.headers["x-aurora-user-id"];

  if (!externalAuthId || Array.isArray(externalAuthId)) {
    throw request.server.httpErrors.unauthorized("Missing Aurora user context.");
  }

  return {
    id: externalAuthId,
    externalAuthId,
    role: "USER",
  };
}
