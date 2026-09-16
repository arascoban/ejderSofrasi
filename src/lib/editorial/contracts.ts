import type { JSONContent } from "@tiptap/core";
import type { Entity, Period } from "@/lib/domain/types";

export type ArticleState = "draft" | "published" | "withdrawn";

export interface EditorialArticle {
  articleId: string;
  entityId: Entity["id"];
  language: "tr";
  state: ArticleState;
  publishedRevisionId: string | null;
}

export interface EditorialRevision {
  revisionId: string;
  articleId: string;
  revisionNumber: number;
  schemaVersion: string;
  baseCoreReleaseId: string;
  period: Period | null;
  document: JSONContent;
  changeNote: string;
  publishedAt: string;
}

export interface MediaAttachment {
  mediaId: string;
  role: "cover" | "portrait" | "gallery" | "map_thumbnail" | "inline";
  position: number;
  period: Period | null;
  alternativeTextTr: string;
  captionTr: string;
  sourceLabel: string;
  creatorCredit: string;
  rightsNote: string;
  visualKind: string;
  publicUrl: string;
  width: number | null;
  height: number | null;
}

export interface PublishedEditorialContent {
  article: EditorialArticle;
  revision: EditorialRevision;
  media: readonly MediaAttachment[];
}

export interface EditorialRepository {
  getPublishedContent(entityId: string): Promise<PublishedEditorialContent | null>;
}

/** A aşamasında bulut yoktur; okuma katmanı açıkça boş sonuç döndürür. */
export const emptyEditorialRepository: EditorialRepository = {
  async getPublishedContent() {
    return null;
  },
};
