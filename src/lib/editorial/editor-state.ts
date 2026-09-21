import type { JSONContent } from "@tiptap/core";
import type { Period } from "@/lib/domain/types";

export interface EditorRevisionSummary {
  revisionId: string;
  revisionNumber: number;
  changeNote: string;
  publishedAt: string;
  createdBy: string;
  sourceRevisionId: string | null;
}

export interface EditorDraftMedia {
  mediaId: string;
  role: "cover" | "portrait" | "gallery" | "map_thumbnail" | "inline";
  position: number;
  period: Period | null;
  alternativeTextTr: string;
  captionTr: string;
  previewUrl: string;
}

export interface EditorArticleState {
  articleId: string | null;
  draftId: string | null;
  entityId: string;
  baseCoreReleaseId: string;
  document: JSONContent;
  period: Period | null;
  changeNote: string;
  lockVersion: number | null;
  basedOnRevisionId: string | null;
  publishedRevisionId: string | null;
  revisions: readonly EditorRevisionSummary[];
  draftMedia: readonly EditorDraftMedia[];
}

export interface SaveDraftInput {
  entityId: string;
  document: unknown;
  baseCoreReleaseId: string;
  period: Period | null;
  changeNote: string;
  expectedLockVersion: number | null;
  expectedDraftId: string | null;
  expectedPublishedRevisionId: string | null;
}

export interface EditorialActionResult {
  ok: boolean;
  message: string;
  lockVersion?: number;
  updatedAt?: string;
  revisionId?: string;
  conflict?: boolean;
  draftId?: string;
}

export interface ProcessMediaInput {
  entityId: string;
  mediaId: string;
  originalPath: string;
  declaredMimeType: string;
  alternativeTextTr: string;
  captionTr: string;
  sourceLabel: string;
  creatorCredit: string;
  rightsNote: string;
  visualKind: string;
  role: EditorDraftMedia["role"];
  period: Period | null;
  expectedDraftId: string;
  expectedLockVersion: number;
}
