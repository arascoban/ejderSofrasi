import "server-only";

import { createHash } from "node:crypto";
import sharp from "sharp";
import { MAX_MEDIA_BYTES } from "./media-limits";

export const MAX_MEDIA_DIMENSION = 12_000;
export const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

const MIME_BY_FORMAT: Record<string, AllowedMediaType | undefined> = {
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heif: "image/avif",
  avif: "image/avif",
};

const VARIANTS = [
  { kind: "thumbnail", width: 320, quality: 78 },
  { kind: "small", width: 640, quality: 80 },
  { kind: "medium", width: 1280, quality: 82 },
  { kind: "large", width: 2400, quality: 84 },
] as const;

export interface ProcessedMediaVariant {
  kind: (typeof VARIANTS)[number]["kind"];
  buffer: Buffer;
  width: number;
  height: number;
  mimeType: "image/webp";
}

export interface ProcessedMedia {
  contentHashSha256: string;
  mimeType: AllowedMediaType;
  width: number;
  height: number;
  byteSize: number;
  variants: readonly ProcessedMediaVariant[];
}

export async function processWikiImage(
  original: Buffer,
  declaredMimeType: string,
): Promise<ProcessedMedia> {
  if (original.byteLength < 1 || original.byteLength > MAX_MEDIA_BYTES) {
    throw new Error("Görsel dosyası 12 MB sınırını aşıyor veya boş.");
  }
  if (!ALLOWED_MEDIA_TYPES.includes(declaredMimeType as AllowedMediaType)) {
    throw new Error("Yalnızca JPEG, PNG, WebP ve AVIF görselleri kabul edilir.");
  }

  const image = sharp(original, { limitInputPixels: MAX_MEDIA_DIMENSION * MAX_MEDIA_DIMENSION });
  const metadata = await image.metadata();
  const detectedMimeType = metadata.format ? MIME_BY_FORMAT[metadata.format] : undefined;
  if (!detectedMimeType || detectedMimeType !== declaredMimeType) {
    throw new Error("Dosyanın gerçek görsel biçimi bildirilen MIME türüyle eşleşmiyor.");
  }
  if (!metadata.width || !metadata.height) throw new Error("Görsel boyutları okunamadı.");
  if (metadata.width > MAX_MEDIA_DIMENSION || metadata.height > MAX_MEDIA_DIMENSION) {
    throw new Error("Görsel genişliği veya yüksekliği 12.000 pikseli aşamaz.");
  }
  if ((metadata.pages ?? 1) > 1) throw new Error("Animasyonlu veya çok sayfalı görseller desteklenmiyor.");

  const variants = await Promise.all(
    VARIANTS.map(async ({ kind, width, quality }) => {
      const { data, info } = await sharp(original, { limitInputPixels: MAX_MEDIA_DIMENSION * MAX_MEDIA_DIMENSION })
        .rotate()
        .resize({ width, withoutEnlargement: true, fit: "inside" })
        .webp({ quality, effort: 4 })
        .toBuffer({ resolveWithObject: true });
      return {
        kind,
        buffer: data,
        width: info.width,
        height: info.height,
        mimeType: "image/webp" as const,
      };
    }),
  );

  return {
    contentHashSha256: createHash("sha256").update(original).digest("hex"),
    mimeType: detectedMimeType,
    width: metadata.width,
    height: metadata.height,
    byteSize: original.byteLength,
    variants,
  };
}
