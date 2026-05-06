"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";

export function DeckActions({ deckId, deckName }: { deckId: string; deckName: string }) {
  const t = useTranslations("deck");
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    await fetch(`/api/decks/${deckId}`, { method: "DELETE" });
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <>
      <button
        onClick={() => setDeleteOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-800 text-red-500 font-semibold text-sm hover:bg-zinc-900 active:scale-95 transition-all"
      >
        <Trash2 className="h-4 w-4" />
        {t("deleteDeck")}
      </button>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>{t("deleteDeck")}</DialogTitle>
            <DialogDescription className="text-zinc-400">
              {t("deleteConfirm")} &quot;{deckName}&quot;
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setDeleteOpen(false)}
              className="px-4 py-2 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-semibold hover:bg-zinc-800 transition-all"
            >
              {t("cancel")}
            </button>
            <button
              disabled={deleting}
              onClick={handleDelete}
              className="px-4 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500 active:scale-95 disabled:opacity-50 transition-all"
            >
              {t("delete")}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
