/* eslint-disable @next/next/no-img-element -- Yetkili editör için kısa ömürlü Storage önizlemesi. */
"use client";

import { createContext, useContext } from "react";
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from "@tiptap/react";
import type { EditorDraftMedia } from "@/lib/editorial/editor-state";
import { EditorialImage, editorialExtensions } from "@/lib/editorial/extensions";

export const EditorMediaContext = createContext<readonly EditorDraftMedia[]>([]);

function InlineMediaPreview({ node }: NodeViewProps) {
  const media = useContext(EditorMediaContext).find((entry) => entry.mediaId === node.attrs.mediaId);
  return (
    <NodeViewWrapper as="figure" contentEditable={false}>
      {media ? (
        <>
          <img src={media.previewUrl} alt={media.alternativeTextTr} />
          {media.captionTr ? <figcaption>{media.captionTr}</figcaption> : null}
        </>
      ) : <span>Görsel önizlemesi hazırlanıyor veya bu taslağa bağlı değil.</span>}
    </NodeViewWrapper>
  );
}

// Node views affect the editor DOM only. Signed URLs never enter stored JSON
// or the shared server-side article renderer.
export const editorPreviewExtensions = editorialExtensions.map((extension) =>
  extension.name === "image"
    ? EditorialImage.extend({ addNodeView: () => ReactNodeViewRenderer(InlineMediaPreview) })
    : extension,
);
