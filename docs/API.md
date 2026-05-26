# Aurora API Surface

## Health

- `GET /health`

## Imports

- `POST /v1/imports`
  - Body: `{ "url": string, "playlistId"?: string, "preferredQuality"?: "preview" | "standard" | "lossless" }`
  - Creates a durable import record and queues extraction.
- `GET /v1/imports/:id`
  - Returns import state, recent processing jobs, and completed track when available.

## Storage

- `POST /v1/storage/uploads`
  - Body: `{ "filename": string, "contentType": string, "kind": "audio" | "thumbnail" | "waveform" | "playlist-cover" | "preview" }`
  - Returns signed upload URL and storage key.

## Library and Search

- `GET /v1/library/tracks?q=&take=`
- `GET /v1/search?q=`

## Streaming

- `GET /v1/tracks/:id/stream`
  - Authenticates ownership and redirects to a short-lived signed media URL.

Current local auth boundary expects `x-aurora-user-id` for Phase 1 development. Phase 2 replaces this with Clerk/Auth.js token verification and user provisioning.
