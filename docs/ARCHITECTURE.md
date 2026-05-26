# Aurora Architecture

Aurora is organized as a production workspace with independent deployable apps and shared platform packages.

## Phase 1 Foundation

- `apps/web`: Next.js App Router shell preserving the existing cinematic liquid-glass landing experience.
- `apps/api`: Fastify API for auth-protected imports, storage signing, library/search, and streaming redirects.
- `apps/worker`: BullMQ media worker for universal import, yt-dlp metadata/download, FFmpeg normalization/transcoding, and waveform artifact generation.
- `packages/database`: Prisma schema and lazy Prisma client.
- `packages/queues`: Redis/BullMQ queue factories and shared job payload contracts.
- `packages/storage`: signed S3 upload/read URL abstraction, ready for CDN-backed delivery.
- `packages/config`: typed environment validation.
- `packages/types`: domain-level API and realtime event types.

## Service Boundaries

The web app should never process media directly. It requests API operations, receives job IDs, and subscribes to realtime job progress. The API owns authorization, abuse prevention, signed upload URLs, metadata writes, and user-facing query patterns. Workers own untrusted media execution, retries, and CPU-heavy FFmpeg/yt-dlp work.

## Media Flow

1. User submits a supported URL.
2. API validates the URL, detects source, creates an `Import`, and enqueues `aurora.imports`.
3. Worker probes metadata with yt-dlp, downloads highest-quality audio, normalizes/transcodes with FFmpeg, generates waveform data, stores media assets, and creates a `Track`.
4. API exposes track library, search, playlist insertion, and signed stream delivery.
5. Realtime progress will be exposed over SSE/WebSocket in Phase 5 using the same `ImportProgressEvent` type.

## Scale Notes

- API and worker processes are horizontally scalable because Redis owns job coordination and Postgres owns durable state.
- Media workers can run on separate CPU-optimized machines with FFmpeg and yt-dlp installed.
- Storage is behind signed URLs so the API does not become a media bandwidth bottleneck.
- Prisma indexes favor owner-scoped library queries, queue/admin monitoring, import status dashboards, and search foundations.

## Phase Roadmap

1. Foundation: workspace, configs, API/worker skeleton, schema, Docker.
2. Auth and data hardening: Clerk/Auth.js verification, migrations, user provisioning, RLS-style service guards.
3. Media pipeline: robust progress parsing, thumbnails, waveform analyzer, S3 uploads, cleanup and retry recovery.
4. Product APIs: playlists, drag ordering, favorites, listening history, byte-range streaming proxy fallback.
5. Realtime and intelligence: SSE/WebSockets, notifications, analytics events, recommendation materialization.
6. Production readiness: observability, admin dashboards, WAF/rate policy, load testing, deployment manifests.
