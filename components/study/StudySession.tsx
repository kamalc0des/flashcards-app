"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { StudyCard } from "./StudyCard";
import { ReviewButtons } from "./ReviewButtons";
import { RichEditor } from "@/components/editor/RichEditor";
import type { StudyCard as StudyCardType } from "@/types";
import type { JSONContent } from "@tiptap/react";
import { emptyTiptap } from "@/lib/tiptap";

interface StudySessionProps {
  deckId: string;
  deckName: string;
  deckColor: string;
}

export function StudySession({ deckId, deckName, deckColor }: StudySessionProps) {
  const t = useTranslations("study");
  const router = useRouter();

  const [queue, setQueue] = useState<StudyCardType[]>([]);
  const [current, setCurrent] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [learned, setLearned] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [editFront, setEditFront] = useState<JSONContent>(emptyTiptap());
  const [editBack, setEditBack] = useState<JSONContent>(emptyTiptap());
  const [editSaving, setEditSaving] = useState(false);
  const [cardVersion, setCardVersion] = useState(0);

  useEffect(() => {
    fetch(`/api/decks/${deckId}/study-queue`)
      .then((r) => r.json())
      .then((data: StudyCardType[]) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setQueue(shuffled);
        setTotalCards(shuffled.length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [deckId]);

  const handleBack = useCallback(() => {
    router.refresh();
    router.push(`/decks/${deckId}`);
  }, [router, deckId]);

  const handleFlip = useCallback(() => setFlipped(true), []);

  const handleReview = useCallback(
    (quality: 0 | 1 | 2 | 3) => {
      const card = queue[current];
      setFlipped(false);

      if (quality === 0) {
        // Requeue at end, not counted as learned
        setQueue((q) => {
          const next = [...q];
          next.splice(current, 1);
          next.push(card);
          return next;
        });
      } else {
        const nextLearned = learned + 1;
        setLearned(nextLearned);
        setCurrent((c) => c + 1);
        if (current + 1 >= queue.length) {
          router.refresh();
        }
      }

      fetch(`/api/decks/${deckId}/study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, quality }),
      }).catch(() => {});
    },
    [queue, current, deckId, learned, router]
  );

  const openEdit = useCallback(() => {
    const card = queue[current];
    if (!card) return;
    setEditFront(card.front as JSONContent);
    setEditBack(card.back as JSONContent);
    setEditing(true);
  }, [queue, current]);

  const saveEdit = useCallback(async () => {
    const card = queue[current];
    if (!card) return;
    setEditSaving(true);
    await fetch(`/api/decks/${deckId}/cards/${card.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ front: editFront, back: editBack }),
    });
    setQueue((q) => {
      const next = [...q];
      next[current] = { ...next[current], front: editFront, back: editBack };
      return next;
    });
    setCardVersion((v) => v + 1);
    setEditSaving(false);
    setEditing(false);
  }, [queue, current, deckId, editFront, editBack]);

  if (loading) {
    return (
      <div className="h-dvh bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse text-sm">{t("loading")}</div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="h-dvh bg-zinc-950 text-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-bold mb-2">{t("empty")}</h2>
          <p className="text-zinc-400 text-sm mb-8">{t("emptyDesc")}</p>
          <button
            onClick={handleBack}
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            ← {t("backToDeck")}
          </button>
        </div>
      </div>
    );
  }

  if (current >= queue.length) {
    return (
      <div className="h-dvh bg-zinc-950 text-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-5">🎉</div>
          <h2 className="text-2xl font-bold mb-2">{t("done")}</h2>
          <p className="text-zinc-400 text-sm mb-1">
            {t(learned > 1 ? "masteredCountPlural" : "masteredCount", { count: learned })}
          </p>
          <p className="text-zinc-500 text-sm mb-8">
            <span className="font-semibold" style={{ color: deckColor }}>{deckName}</span>
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleBack}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-zinc-950 active:scale-95 transition-all"
              style={{ backgroundColor: deckColor }}
            >
              {t("backToDeck")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const card = queue[current];
  const progress = totalCards > 0 ? (learned / totalCards) * 100 : 0;

  return (
    <div className="h-dvh bg-zinc-950 text-white flex flex-col overflow-hidden relative">
      <div className="w-full max-w-lg mx-auto flex flex-col h-full px-4 pt-5 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-sm py-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {deckName}
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: deckColor }} />
            <span className="text-sm text-zinc-400">{learned} / {totalCards}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-5 shrink-0">
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, backgroundColor: deckColor }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="flex-1 min-h-0 mb-4">
          <StudyCard
            key={`${card.id}-${cardVersion}`}
            card={card}
            flipped={flipped}
            onFlip={handleFlip}
            accentColor={deckColor}
            onEdit={openEdit}
          />
        </div>

        {/* Actions */}
        <div className="shrink-0">
          {!flipped ? (
            <button
              onClick={handleFlip}
              className="w-full py-4 rounded-2xl font-semibold text-base text-zinc-950 active:scale-95 transition-all"
              style={{ backgroundColor: deckColor }}
            >
              {t("flip")}
            </button>
          ) : (
            <ReviewButtons card={card} onReview={handleReview} />
          )}
        </div>
      </div>

      {/* Inline edit overlay */}
      {editing && (
        <div className="absolute inset-0 bg-zinc-950/95 flex flex-col z-10 px-4 pt-5 pb-4">
          <div className="w-full max-w-lg mx-auto flex flex-col h-full">
            <div className="flex items-center justify-between mb-6 shrink-0">
              <h2 className="text-base font-semibold">{t("editCard")}</h2>
              <button
                onClick={() => setEditing(false)}
                className="text-zinc-500 hover:text-white transition-colors text-sm"
              >
                {t("cancelEdit")}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-5 min-h-0">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{t("front")}</label>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  <RichEditor content={editFront} onChange={setEditFront} />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">{t("back")}</label>
                <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-3">
                  <RichEditor content={editBack} onChange={setEditBack} />
                </div>
              </div>
            </div>
            <div className="shrink-0 pt-4">
              <button
                onClick={saveEdit}
                disabled={editSaving}
                className="w-full py-4 rounded-2xl font-semibold text-base text-zinc-950 active:scale-95 transition-all disabled:opacity-50"
                style={{ backgroundColor: deckColor }}
              >
                {editSaving ? t("saving") : t("saveEdit")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
