import type { JSONContent } from "@tiptap/react";

export function textToTiptap(text: string): JSONContent {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };
}

export function emptyTiptap(): JSONContent {
  return { type: "doc", content: [{ type: "paragraph" }] };
}

export function tiptapToPlainText(doc: JSONContent): string {
  if (!doc?.content) return "";
  return doc.content
    .map((node) => {
      if (node.type === "paragraph" || node.type === "heading") {
        return (node.content || []).map((n) => n.text ?? "").join("") + "\n";
      }
      if (node.type === "codeBlock") {
        return (node.content || []).map((n) => n.text ?? "").join("") + "\n";
      }
      return "";
    })
    .join("")
    .trim();
}
