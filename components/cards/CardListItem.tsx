"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { RichEditor } from "@/components/editor/RichEditor";
import { Pencil, Trash2, CirclePause, CirclePlay, ChevronDown, ChevronRight } from "lucide-react";
import type { CardSummary } from "@/types";

export function CardListItem({
  card,
  index,
  deckId,
}: {
  card: CardSummary & { suspended?: boolean };
  index: number;
  deckId: string;
}) {
  const t = useTranslations("deck");
  const locale = useLocale();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [suspended, setSuspended] = useState(card.suspended ?? false);
  const [toggling, setToggling] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await fetch(`/api/decks/${deckId}/cards/${card.id}`, { method: "DELETE" });
    router.refresh();
  };

  const handleSuspend = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setToggling(true);
    const res = await fetch(`/api/decks/${deckId}/cards/${card.id}/suspend`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      setSuspended(data.suspended);
    }
    setToggling(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/${locale}/decks/${deckId}/cards/${card.id}/edit`);
  };

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${suspended ? "border-amber-900/50 bg-zinc-900/60 opacity-60" : "border-zinc-800 bg-zinc-900"}`}>
      <div
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer hover:bg-zinc-800/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="text-xs text-zinc-600 w-5 shrink-0 font-mono">{index}</span>

        <div className="flex-1 min-w-0 pointer-events-none text-sm text-zinc-200">
          <RichEditor content={card.front} editable={false} />
        </div>

        {/* Status badge + action buttons */}
        <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
          {/* Status badge */}
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
            suspended
              ? "bg-amber-950/60 text-amber-400 border border-amber-800/50"
              : "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
          }`}>
            {suspended ? t("cardSuspended") : t("cardActive")}
          </span>

          {/* Suspend / Activate toggle */}
          <button
            onClick={handleSuspend}
            disabled={toggling}
            title={suspended ? t("unsuspendCard") : t("suspendCard")}
            className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 ${
              suspended
                ? "text-emerald-400 hover:bg-emerald-950/40"
                : "text-amber-400 hover:bg-amber-950/40"
            }`}
          >
            {suspended
              ? <CirclePlay className="h-4 w-4" />
              : <CirclePause className="h-4 w-4" />
            }
          </button>

          <button
            onClick={handleEdit}
            title={t("editCard")}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleDelete}
            title={t("deleteCard")}
            className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-zinc-700 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Chevron outside stopPropagation to toggle expand */}
        {expanded
          ? <ChevronDown className="h-4 w-4 text-zinc-500 shrink-0" />
          : <ChevronRight className="h-4 w-4 text-zinc-500 shrink-0" />
        }
      </div>

      {expanded && (
        <div className="border-t border-zinc-800 px-4 py-3.5 bg-zinc-950/50">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-2">{t("back")}</p>
          <div className="text-sm text-zinc-300">
            <RichEditor content={card.back} editable={false} />
          </div>
        </div>
      )}
    </div>
  );
}
