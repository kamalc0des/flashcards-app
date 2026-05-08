import type { JSONContent } from "@tiptap/react";
import { generateJSON } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

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

const HTML_EXTENSIONS = [StarterKit, TextStyle, Color, Highlight.configure({ multicolor: true })];

export function htmlToTiptap(html: string): JSONContent {
  // Plain text (no tags) → fast path
  if (!html.includes("<")) return textToTiptap(html);
  try {
    return generateJSON(html, HTML_EXTENSIONS);
  } catch {
    return textToTiptap(html.replace(/<[^>]+>/g, ""));
  }
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
