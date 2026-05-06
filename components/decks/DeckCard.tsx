"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DeckSummary } from "@/types";

export function DeckCard({ deck }: { deck: DeckSummary }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/decks/${deck.id}`, { method: "DELETE" });
    router.refresh();
  };

  return (
    <>
      <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900 p-5 gap-4 h-full">
        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base text-white truncate mb-1">{deck.name}</p>
          {deck.description && (
            <p className="text-zinc-500 text-xs line-clamp-2 mb-2">{deck.description}</p>
          )}
          <p className="text-zinc-500 text-sm">
            {deck.cardCount} carte{deck.cardCount !== 1 ? "s" : ""}
            {deck.dueCount > 0 && (
              <span className="ml-2 text-amber-400 font-medium">· {deck.dueCount} à réviser</span>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/decks/${deck.id}/study`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-100 active:scale-95 transition-all"
          >
            Réviser
          </Link>
          <Link
            href={`/decks/${deck.id}`}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-700 text-zinc-300 hover:bg-zinc-800 active:scale-95 transition-all"
          >
            Modifier
          </Link>
          <button
            onClick={() => setDeleteOpen(true)}
            className="p-1.5 rounded-lg border border-zinc-800 text-red-500 hover:bg-zinc-800 active:scale-95 transition-all ml-auto"
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Supprimer le deck</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Supprimer &quot;{deck.name}&quot; et toutes ses cartes ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 transition-all"
            >
              Annuler
            </button>
            <button
              disabled={deleting}
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 active:scale-95 disabled:opacity-50 transition-all"
            >
              Supprimer
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
