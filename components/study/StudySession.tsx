"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { StudyCard } from "./StudyCard";
import { ReviewButtons } from "./ReviewButtons";
import type { StudyCard as StudyCardType } from "@/types";

interface StudySessionProps {
  deckId: string;
  deckName: string;
  deckColor: string;
}

export function StudySession({ deckId, deckName, deckColor }: StudySessionProps) {
  const t = useTranslations("study");
  const [queue, setQueue] = useState<StudyCardType[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [learned, setLearned] = useState(0);

  useEffect(() => {
    fetch(`/api/decks/${deckId}/study-queue`)
      .then((r) => r.json())
      .then((data: StudyCardType[]) => {
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        setQueue(shuffled);
        setLoading(false);
      });
  }, [deckId]);

  const handleFlip = useCallback(() => setFlipped(true), []);

  const handleReview = useCallback(
    async (quality: 0 | 1 | 2 | 3) => {
      const card = queue[current];
      await fetch(`/api/decks/${deckId}/study`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, quality }),
      });
      setFlipped(false);
      if (quality === 0) {
        // Again — requeue at end, not counted as learned
        setQueue((q) => {
          const next = [...q];
          next.splice(current, 1);
          next.push(card);
          return next;
        });
        // current index stays the same (next card shifts in)
      } else {
        // Hard / Good / Easy — card is learned, move forward
        setLearned((v) => v + 1);
        setCurrent((v) => v + 1);
      }
    },
    [queue, current, deckId]
  );

  if (loading) {
    return (
      <div className="min-h-dvh bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse text-sm">Loading...</div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="min-h-dvh bg-zinc-950 text-white flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h2 className="text-xl font-bold mb-2">{t("empty")}</h2>
          <p className="text-zinc-400 text-sm mb-8">{t("emptyDesc")}</p>
          <Link
            href={`/decks/${deckId}`}
            className="text-zinc-400 hover:text-white text-sm transition-colors"
          >
            ← {t("backToDeck")}
          </Link>
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
            <span className="text-white font-semibold">{learned}</span> carte{learned > 1 ? "s" : ""} maîtrisée{learned > 1 ? "s" : ""}
          </p>
          <p className="text-zinc-500 text-sm mb-8">
            Deck: <span className="font-semibold" style={{ color: deckColor }}>{deckName}</span>
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setCurrent(0); setLearned(0); setFlipped(false); setQueue((q) => [...q].sort(() => Math.random() - 0.5)); }}
              className="w-full py-3.5 rounded-2xl font-semibold text-sm text-zinc-950 transition-colors active:scale-95"
              style={{ backgroundColor: deckColor }}
            >
              Study again
            </button>
            <Link
              href="/dashboard"
              className="w-full py-3.5 rounded-2xl border border-zinc-700 text-zinc-300 font-semibold text-sm text-center hover:bg-zinc-800 transition-colors"
            >
              {t("backToDeck")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const card = queue[current];
  const totalUnique = learned + (queue.length - current);
  const progress = (learned / totalUnique) * 100;

  return (
    <div className="h-dvh bg-zinc-950 text-white flex flex-col overflow-hidden">
      <div className="w-full max-w-lg mx-auto flex flex-col h-full px-4 pt-5 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <Link
            href={`/decks/${deckId}`}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-sm py-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {deckName}
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: deckColor }} />
            <span className="text-sm text-zinc-400">{learned} / {totalUnique}</span>
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

        {/* Card — takes all remaining space */}
        <div className="flex-1 min-h-0 mb-4">
          <StudyCard card={card} flipped={flipped} onFlip={handleFlip} accentColor={deckColor} />
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
    </div>
  );
}
