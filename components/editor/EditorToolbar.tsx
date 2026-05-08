"use client";

import type { Editor } from "@tiptap/react";
import { Toggle } from "@/components/ui/toggle";
import {
  Bold,
  Italic,
  Code,
  Code2,
  Highlighter,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Minus,
} from "lucide-react";

const COLORS = [
  { label: "Default", value: "" },
  { label: "Red", value: "#ef4444" },
  { label: "Orange", value: "#f97316" },
  { label: "Yellow", value: "#eab308" },
  { label: "Green", value: "#22c55e" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Purple", value: "#8b5cf6" },
  { label: "Pink", value: "#ec4899" },
];

export function EditorToolbar({ editor }: { editor: Editor | null }) {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-700 px-2 py-1 bg-zinc-900/50">
      <Toggle
        size="sm"
        pressed={editor.isActive("bold")}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
        aria-label="Bold"
      >
        <Bold className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("italic")}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        aria-label="Italic"
      >
        <Italic className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("strike")}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-3.5 w-3.5" />
      </Toggle>

      <div className="w-px h-5 bg-border mx-0.5" />

      <Toggle
        size="sm"
        pressed={editor.isActive("code")}
        onPressedChange={() => editor.chain().focus().toggleCode().run()}
        aria-label="Inline code"
      >
        <Code className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("codeBlock")}
        onPressedChange={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-label="Code block"
      >
        <Code2 className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("highlight")}
        onPressedChange={() => editor.chain().focus().toggleHighlight().run()}
        aria-label="Highlight"
      >
        <Highlighter className="h-3.5 w-3.5" />
      </Toggle>

      <div className="w-px h-5 bg-border mx-0.5" />

      <Toggle
        size="sm"
        pressed={editor.isActive("bulletList")}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        aria-label="Bullet list"
      >
        <List className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("orderedList")}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label="Ordered list"
      >
        <ListOrdered className="h-3.5 w-3.5" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive("blockquote")}
        onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        aria-label="Blockquote"
      >
        <Quote className="h-3.5 w-3.5" />
      </Toggle>

      <div className="w-px h-5 bg-border mx-0.5" />

      {/* Color picker */}
      <div className="flex items-center gap-0.5">
        {COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            title={c.label}
            className="w-4 h-4 rounded-full border border-border/50 transition-transform hover:scale-110"
            style={{ backgroundColor: c.value || "currentColor" }}
            onClick={() => {
              if (c.value) {
                editor.chain().focus().setColor(c.value).run();
              } else {
                editor.chain().focus().unsetColor().run();
              }
            }}
          />
        ))}
      </div>

      <div className="w-px h-5 bg-border mx-0.5" />

      <button
        type="button"
        title="Horizontal rule"
        className="p-1 rounded hover:bg-muted"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
