import "server-only";

import type { JSONContent } from "@tiptap/core";
import { generateHTML } from "@tiptap/html/server";
import { assertArticleDocument } from "./document";
import { editorialExtensions } from "./extensions";

export interface PublishedInlineMedia {
  mediaId: string;
  publicUrl: string;
  alternativeTextTr: string;
  captionTr: string;
}

function withResolvedImages(
  node: JSONContent,
  mediaById: ReadonlyMap<string, PublishedInlineMedia>,
): JSONContent {
  const copy: JSONContent = { ...node };
  if (node.type === "image") {
    const mediaId = typeof node.attrs?.mediaId === "string" ? node.attrs.mediaId : "";
    const media = mediaById.get(mediaId);
    if (!media) throw new Error(`Yayımlanmış görsel bulunamadı: ${mediaId}`);
    copy.attrs = {
      ...node.attrs,
      src: media.publicUrl,
      alt: media.alternativeTextTr,
      title: media.captionTr || null,
    };
  }
  if (node.content) {
    copy.content = node.content.map((child) => withResolvedImages(child, mediaById));
  }
  return copy;
}

export function renderPublishedArticle(
  document: unknown,
  media: readonly PublishedInlineMedia[] = [],
): string {
  assertArticleDocument(document);
  const mediaById = new Map(media.map((entry) => [entry.mediaId, entry]));
  return generateHTML(withResolvedImages(document, mediaById), editorialExtensions);
}
