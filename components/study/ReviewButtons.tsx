"use client";

import { useTranslations } from "next-intl";
import { projectedIntervals } from "@/lib/sm2";
import type { StudyCard } from "@/types";

interface ReviewButtonsProps {
  card: StudyCard;
  onReview: (quality: 0 | 1 | 2 | 3) => void;
}

const BUTTONS = [
  { quality: 0 as const, label: "again", color: "border-red-800 text-red-400 hover:bg-red-950/40" },
  { quality: 1 as const, label: "hard", color: "border-orange-800 text-orange-400 hover:bg-orange-950/40" },
  { quality: 2 as const, label: "good", color: "border-blue-800 text-blue-400 hover:bg-blue-950/40" },
  { quality: 3 as const, label: "easy", color: "border-green-800 text-green-400 hover:bg-green-950/40" },
] as const;

export function ReviewButtons({ card, onReview }: ReviewButtonsProps) {
  const t = useTranslations("study");
  const state = card.review ?? { ease: 2.5, interval: 1, reps: 0, lapses: 0 };
  const intervals = projectedIntervals(state);

  return (
    <div className="grid grid-cols-4 gap-2">
      {BUTTONS.map(({ quality, label, color }) => (
        <button
          key={quality}
          onClick={() => onReview(quality)}
          className={`flex flex-col items-center py-3.5 rounded-2xl border bg-zinc-900 gap-1 active:scale-95 transition-all ${color}`}
        >
          <span className="font-semibold text-sm">{t(label)}</span>
          <span className="text-xs opacity-60">{intervals[quality]}</span>
        </button>
      ))}
    </div>
  );
}
