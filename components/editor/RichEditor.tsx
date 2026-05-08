"use client";

import { useEditor, EditorContent as TiptapContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color } from "@tiptap/extension-color";
import { TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import Placeholder from "@tiptap/extension-placeholder";
import { createLowlight, common } from "lowlight";
import type { JSONContent } from "@tiptap/react";
import { EditorToolbar } from "./EditorToolbar";
import "./editor.css";

const lowlight = createLowlight(common);

interface RichEditorProps {
  content?: JSONContent;
  onChange?: (content: JSONContent) => void;
  placeholder?: string;
  editable?: boolean;
}

export function RichEditor({ content, onChange, placeholder, editable = true }: RichEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Placeholder.configure({ placeholder: placeholder ?? "" }),
    ],
    content: content ?? { type: "doc", content: [{ type: "paragraph" }] },
    editable,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
  });

  if (!editable) {
    return (
      <div className="prose prose-sm max-w-none dark:prose-invert tiptap-readonly">
        <TiptapContent editor={editor} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-700 overflow-hidden focus-within:border-zinc-500 bg-zinc-800 transition-colors">
      <EditorToolbar editor={editor} />
      <div className="p-3 min-h-[120px] prose prose-sm max-w-none prose-invert">
        <TiptapContent editor={editor} />
      </div>
    </div>
  );
}
