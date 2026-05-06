"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, X } from "lucide-react";

interface DeckManagerProps {
  deckId: string;
  initialName: string;
  initialDescription: string | null;
}

export function DeckManager({ deckId, initialName, initialDescription }: DeckManagerProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await fetch(`/api/decks/${deckId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), description: description.trim() || null }),
    });
    setSaving(false);
    setEditing(false);
    router.refresh();
  };

  const handleCancel = () => {
    setName(initialName);
    setDescription(initialDescription ?? "");
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between gap-3 group">
        <div>
          <h1 className="text-2xl font-bold text-white">{name}</h1>
          {description && <p className="text-zinc-400 text-sm mt-0.5">{description}</p>}
        </div>
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors mt-1 shrink-0"
          title="Rename"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="text-2xl font-bold bg-transparent border-b border-zinc-600 text-white focus:outline-none focus:border-zinc-400 pb-1 transition-colors"
        onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows={2}
        className="w-full px-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 placeholder-zinc-600 text-sm focus:outline-none focus:border-zinc-500 transition-colors resize-none"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !name.trim()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-zinc-950 text-sm font-semibold hover:bg-zinc-100 active:scale-95 disabled:opacity-50 transition-all"
        >
          <Check className="h-3.5 w-3.5" />
          Save
        </button>
        <button
          onClick={handleCancel}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 active:scale-95 transition-all"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
      </div>
    </div>
  );
}
