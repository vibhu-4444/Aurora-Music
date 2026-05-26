export type SourcePlatform =
  | "youtube"
  | "instagram"
  | "tiktok"
  | "facebook"
  | "x"
  | "direct"
  | "unknown";

export type ImportStatus =
  | "queued"
  | "fetching_metadata"
  | "downloading"
  | "extracting"
  | "transcoding"
  | "normalizing"
  | "waveform"
  | "storing"
  | "completed"
  | "failed"
  | "cancelled";

export type MediaQuality = "preview" | "standard" | "lossless";

export interface ImportProgressEvent {
  importId: string;
  jobId: string;
  userId: string;
  status: ImportStatus;
  progress: number;
  message?: string;
  trackId?: string;
  errorCode?: string;
  occurredAt: string;
}

export interface CreateImportRequest {
  url: string;
  playlistId?: string;
  preferredQuality?: MediaQuality;
}

export interface TrackStreamToken {
  trackId: string;
  userId: string;
  expiresAt: string;
}
