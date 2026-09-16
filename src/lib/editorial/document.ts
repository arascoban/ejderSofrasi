import type { JSONContent } from "@tiptap/core";

const ENTITY_ID_PATTERN = /^[A-Z]{3}-\d{4}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const CONTAINER_NODES = new Set([
  "doc",
  "paragraph",
  "heading",
  "bulletList",
  "orderedList",
  "listItem",
  "blockquote",
  "table",
  "tableRow",
  "tableHeader",
  "tableCell",
]);
const LEAF_NODES = new Set(["text", "hardBreak", "horizontalRule", "image"]);
const ALLOWED_MARKS = new Set(["bold", "italic", "strike", "code", "link"]);

export const EMPTY_ARTICLE_DOCUMENT: JSONContent = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

export interface ArticleDocumentIssue {
  path: string;
  message: string;
}

export interface ArticleDocumentValidation {
  valid: boolean;
  issues: ArticleDocumentIssue[];
  nodeCount: number;
  textLength: number;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeExternalHref(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function validateArticleDocument(value: unknown): ArticleDocumentValidation {
  const issues: ArticleDocumentIssue[] = [];
  let nodeCount = 0;
  let textLength = 0;

  function issue(path: string, message: string) {
    if (issues.length < 50) issues.push({ path, message });
  }

  function walk(node: unknown, path: string, depth: number) {
    if (!isObject(node)) {
      issue(path, "Düğüm bir JSON nesnesi olmalıdır.");
      return;
    }
    if (depth > 20) {
      issue(path, "Belge 20 katmandan daha derin olamaz.");
      return;
    }

    nodeCount += 1;
    if (nodeCount > 2_000) {
      issue(path, "Belge en fazla 2.000 düğüm içerebilir.");
      return;
    }

    const type = node.type;
    if (typeof type !== "string" || (!CONTAINER_NODES.has(type) && !LEAF_NODES.has(type))) {
      issue(`${path}/type`, "Desteklenmeyen makale düğümü.");
      return;
    }

    if (type === "doc" && path !== "$") issue(path, "Belge düğümü yalnızca kökte olabilir.");
    if (path === "$" && type !== "doc") issue(path, "Kök düğümün türü doc olmalıdır.");

    if (type === "text") {
      if (typeof node.text !== "string") {
        issue(`${path}/text`, "Metin düğümünde metin bulunmalıdır.");
      } else {
        textLength += node.text.length;
        if (textLength > 100_000) issue(`${path}/text`, "Makale metni 100.000 karakteri aşamaz.");
      }
    }

    if (type === "heading") {
      const level = isObject(node.attrs) ? node.attrs.level : undefined;
      if (![2, 3, 4].includes(Number(level))) {
        issue(`${path}/attrs/level`, "Başlık düzeyi 2, 3 veya 4 olmalıdır.");
      }
    }

    if (type === "image") {
      const mediaId = isObject(node.attrs) ? node.attrs.mediaId : undefined;
      if (typeof mediaId !== "string" || !UUID_PATTERN.test(mediaId)) {
        issue(`${path}/attrs/mediaId`, "Görsel geçerli ve sabit bir medya ID'sine bağlanmalıdır.");
      }
      if (isObject(node.attrs) && typeof node.attrs.src === "string" && node.attrs.src.length > 0) {
        issue(`${path}/attrs/src`, "Ham görsel adresi saklanamaz; adres medya ID'sinden çözülür.");
      }
    }

    if (Array.isArray(node.marks)) {
      node.marks.forEach((mark, index) => {
        const markPath = `${path}/marks/${index}`;
        if (!isObject(mark) || typeof mark.type !== "string" || !ALLOWED_MARKS.has(mark.type)) {
          issue(markPath, "Desteklenmeyen metin işareti.");
          return;
        }
        if (mark.type !== "link") return;

        const attrs = isObject(mark.attrs) ? mark.attrs : {};
        const href = attrs.href;
        const entityId = attrs.entityId;
        if (typeof entityId === "string") {
          if (!ENTITY_ID_PATTERN.test(entityId)) {
            issue(`${markPath}/attrs/entityId`, "Geçersiz dünya varlığı ID'si.");
          }
          if (href !== `/entity/${entityId}`) {
            issue(`${markPath}/attrs/href`, "Varlık bağlantısı sabit ID rotasıyla eşleşmelidir.");
          }
        } else if (typeof href !== "string" || !isSafeExternalHref(href)) {
          issue(`${markPath}/attrs/href`, "Dış bağlantı yalnızca güvenli http/https adresi olabilir.");
        }
      });
    }

    if (node.content !== undefined && !Array.isArray(node.content)) {
      issue(`${path}/content`, "Düğüm içeriği bir dizi olmalıdır.");
      return;
    }
    if (Array.isArray(node.content)) {
      node.content.forEach((child, index) => walk(child, `${path}/content/${index}`, depth + 1));
    }
  }

  walk(value, "$", 0);
  return { valid: issues.length === 0, issues, nodeCount, textLength };
}

export function assertArticleDocument(value: unknown): asserts value is JSONContent {
  const result = validateArticleDocument(value);
  if (!result.valid) {
    const detail = result.issues.map((entry) => `${entry.path}: ${entry.message}`).join("; ");
    throw new Error(`Geçersiz makale belgesi: ${detail}`);
  }
}
