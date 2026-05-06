"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { RichEditor } from "@/components/editor/RichEditor";
import { ChevronLeft } from "lucide-react";
import type { JSONContent } from "@tiptap/react";
import { emptyTiptap } from "@/lib/tiptap";

interface CardFormProps {
  deckId: string;
  cardId?: string;
  initialFront?: JSONContent;
  initialBack?: JSONContent;
  mode: "create" | "edit";
}

export function CardForm({ deckId, cardId, initialFront, initialBack, mode }: CardFormProps) {
  const t = useTranslations("cardForm");
  const locale = useLocale();
  const router = useRouter();
  const [front, setFront] = useState<JSONContent>(initialFront ?? emptyTiptap());
  const [back, setBack] = useState<JSONContent>(initialBack ?? emptyTiptap());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (mode === "create") {
      await fetch(`/api/decks/${deckId}/cards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front, back }),
      });
    } else {
      await fetch(`/api/decks/${deckId}/cards/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front, back }),
      });
    }
    router.push(`/${locale}/decks/${deckId}`);
    router.refresh();
    setLoading(false);
  };

  return (
    <main className="min-h-dvh bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <Link
          href={`/decks/${deckId}`}
          className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-sm mb-8"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("backToDeck")}
        </Link>

        <h1 className="text-2xl font-bold mb-8">
          {mode === "create" ? t("createTitle") : t("editTitle")}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300 uppercase tracking-wide">{t("front")}</label>
            <RichEditor content={front} onChange={setFront} placeholder={t("frontPlaceholder")} />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-zinc-300 uppercase tracking-wide">{t("back")}</label>
            <RichEditor content={back} onChange={setBack} placeholder={t("backPlaceholder")} />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-white text-zinc-950 font-semibold text-sm hover:bg-zinc-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {mode === "create" ? t("create") : t("save")}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 font-semibold text-sm hover:bg-zinc-800 active:scale-95 transition-all"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
