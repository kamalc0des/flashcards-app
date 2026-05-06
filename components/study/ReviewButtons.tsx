"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { projectedIntervals } from "@/lib/sm2";
import type { StudyCard } from "@/types";

interface ReviewButtonsProps {
  card: StudyCard;
  onReview: (quality: 0 | 1 | 2 | 3) => void;
}

const BUTTONS = [
  { quality: 0 as const, label: "again", className: "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950" },
  { quality: 1 as const, label: "hard", className: "border-orange-300 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950" },
  { quality: 2 as const, label: "good", className: "border-blue-300 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950" },
  { quality: 3 as const, label: "easy", className: "border-green-300 text-green-600 hover:bg-green-50 dark:hover:bg-green-950" },
] as const;

export function ReviewButtons({ card, onReview }: ReviewButtonsProps) {
  const t = useTranslations("study");

  const state = card.review ?? { ease: 2.5, interval: 1, reps: 0, lapses: 0 };
  const intervals = projectedIntervals(state);

  return (
    <div className="grid grid-cols-4 gap-2">
      {BUTTONS.map(({ quality, label, className }) => (
        <Button
          key={quality}
          variant="outline"
          className={`flex flex-col h-auto py-3 gap-1 ${className}`}
          onClick={() => onReview(quality)}
        >
          <span className="font-semibold text-sm">{t(label)}</span>
          <span className="text-xs opacity-70">{intervals[quality]}</span>
        </Button>
      ))}
    </div>
  );
}
