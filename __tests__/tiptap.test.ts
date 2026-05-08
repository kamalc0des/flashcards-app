import { describe, it, expect } from "vitest";
import { textToTiptap, emptyTiptap, tiptapToPlainText } from "@/lib/tiptap";

describe("textToTiptap", () => {
  it("wraps text in a doc/paragraph structure", () => {
    const result = textToTiptap("hello");
    expect(result.type).toBe("doc");
    expect(result.content?.[0].type).toBe("paragraph");
    expect(result.content?.[0].content?.[0]).toEqual({ type: "text", text: "hello" });
  });

  it("produces empty paragraph content for empty string", () => {
    const result = textToTiptap("");
    expect(result.content?.[0].content).toEqual([]);
  });

  it("preserves text with special characters", () => {
    const text = "café & résumé <test>";
    const result = textToTiptap(text);
    expect(result.content?.[0].content?.[0]).toEqual({ type: "text", text });
  });
});

describe("emptyTiptap", () => {
  it("returns a doc with one empty paragraph", () => {
    const result = emptyTiptap();
    expect(result.type).toBe("doc");
    expect(result.content).toHaveLength(1);
    expect(result.content?.[0].type).toBe("paragraph");
    expect(result.content?.[0].content).toBeUndefined();
  });

  it("returns a new object each call (not shared reference)", () => {
    const a = emptyTiptap();
    const b = emptyTiptap();
    expect(a).not.toBe(b);
  });
});

describe("tiptapToPlainText", () => {
  it("extracts text from paragraphs", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "hello" }] },
        { type: "paragraph", content: [{ type: "text", text: "world" }] },
      ],
    };
    expect(tiptapToPlainText(doc)).toBe("hello\nworld");
  });

  it("extracts text from headings", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "Title" }] },
      ],
    };
    expect(tiptapToPlainText(doc)).toBe("Title");
  });

  it("extracts text from codeBlocks", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "codeBlock", content: [{ type: "text", text: "const x = 1;" }] },
      ],
    };
    expect(tiptapToPlainText(doc)).toBe("const x = 1;");
  });

  it("returns empty string for null/undefined content", () => {
    expect(tiptapToPlainText({ type: "doc" })).toBe("");
    // @ts-expect-error testing runtime safety
    expect(tiptapToPlainText(null)).toBe("");
  });

  it("handles empty paragraphs", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [] },
        { type: "paragraph", content: [{ type: "text", text: "hello" }] },
      ],
    };
    expect(tiptapToPlainText(doc)).toBe("hello");
  });

  it("trims leading/trailing whitespace", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "paragraph", content: [{ type: "text", text: "  hello  " }] },
      ],
    };
    expect(tiptapToPlainText(doc)).toBe("hello");
  });

  it("ignores unknown node types", () => {
    const doc = {
      type: "doc",
      content: [
        { type: "horizontalRule" },
        { type: "paragraph", content: [{ type: "text", text: "visible" }] },
      ],
    };
    expect(tiptapToPlainText(doc)).toBe("visible");
  });
});
