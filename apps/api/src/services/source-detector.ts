import type { SourcePlatform } from "@aurora/types";

const platformMatchers: Array<[SourcePlatform, RegExp]> = [
  ["youtube", /(?:youtube\.com|youtu\.be)/i],
  ["instagram", /instagram\.com\/(?:reel|p|tv)\//i],
  ["tiktok", /tiktok\.com/i],
  ["facebook", /(?:facebook\.com|fb\.watch)/i],
  ["x", /(?:twitter\.com|x\.com)\//i],
];

export function detectSourcePlatform(url: string): SourcePlatform {
  for (const [platform, matcher] of platformMatchers) {
    if (matcher.test(url)) return platform;
  }

  return /\.(mp4|mov|m4v|webm|mkv)(\?.*)?$/i.test(url) ? "direct" : "unknown";
}
