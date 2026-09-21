import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { Table, TableCell, TableHeader, TableRow } from "@tiptap/extension-table";
import StarterKit from "@tiptap/starter-kit";

const StableLink = Link.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      entityId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-entity-id"),
        renderHTML: (attributes) =>
          attributes.entityId ? { "data-entity-id": String(attributes.entityId) } : {},
      },
    };
  },
}).configure({
  openOnClick: false,
  autolink: false,
  protocols: ["http", "https"],
  HTMLAttributes: {
    rel: "noopener noreferrer",
  },
});

export const EditorialImage = Image.extend({
  addAttributes() {
    return {
      ...(this.parent?.() ?? {}),
      mediaId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-media-id"),
        renderHTML: (attributes) =>
          attributes.mediaId ? { "data-media-id": String(attributes.mediaId) } : {},
      },
    };
  },
}).configure({ allowBase64: false, inline: false });

export const editorialExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3, 4] },
    link: false,
  }),
  StableLink,
  EditorialImage,
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
];
