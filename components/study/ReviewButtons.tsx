"use client";

import { projectedIntervals } from "@/lib/sm2";
import type { StudyCard } from "@/types";

interface ReviewButtonsProps {
  card: StudyCard;
  onReview: (quality: 0 | 1 | 2 | 3) => void;
}

export function ReviewButtons({ card, onReview }: ReviewButtonsProps) {
  const state = card.review ?? { ease: 2.5, interval: 1, reps: 0, lapses: 0 };
  const intervals = projectedIntervals(state);

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => onReview(0)}
        className="flex flex-col items-center py-4 rounded-2xl border border-red-800 bg-zinc-900 text-red-400 hover:bg-red-950/40 gap-1 active:scale-95 transition-all"
      >
        <span className="font-semibold text-sm">Pas correct</span>
        <span className="text-xs opacity-60">{intervals[0]}</span>
      </button>
      <button
        onClick={() => onReview(2)}
        className="flex flex-col items-center py-4 rounded-2xl border border-green-800 bg-zinc-900 text-green-400 hover:bg-green-950/40 gap-1 active:scale-95 transition-all"
      >
        <span className="font-semibold text-sm">Correct</span>
        <span className="text-xs opacity-60">{intervals[2]}</span>
      </button>
    </div>
  );
}
