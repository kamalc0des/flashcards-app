"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StudyCard } from "./StudyCard";
import { ReviewButtons } from "./ReviewButtons";
import { CheckCircle, ArrowLeft } from "lucide-react";
import type { StudyCard as StudyCardType } from "@/types";
import { cn } from "@/lib/utils";

interface StudySessionProps {
  deckId: string;
  deckName: string;
  deckColor: string;
}

export function StudySession({ deckId, deckName, deckColor }: StudySessionProps) {
  const t = useTranslations("study");
  const locale = useLocale();
  const [queue, setQueue] = useState<StudyCardType[]>([]);
  const [current, setCurrent] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

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
      setCurrent((v) => v + 1);
    },
    [queue, current, deckId]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Loading...</div>
      </div>
    );
  }

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="text-4xl">🎉</div>
        <h2 className="text-xl font-semibold">{t("empty")}</h2>
        <p className="text-muted-foreground max-w-sm">{t("emptyDesc")}</p>
        <Link href={`/decks/${deckId}`} className={cn(buttonVariants())}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToDeck")}
        </Link>
      </div>
    );
  }

  if (current >= queue.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <CheckCircle className="h-16 w-16 text-green-500" />
        <h2 className="text-xl font-semibold">{t("done")}</h2>
        <p className="text-muted-foreground max-w-sm">{t("doneDesc")}</p>
        <Link href={`/decks/${deckId}`} className={cn(buttonVariants())}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("backToDeck")}
        </Link>
      </div>
    );
  }

  const card = queue[current];
  const progress = (current / queue.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/decks/${deckId}`}
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {deckName}
        </Link>
        <span className="text-sm text-muted-foreground">
          {current + 1} / {queue.length}
        </span>
      </div>

      <Progress value={progress} className="h-1.5" />

      <StudyCard card={card} flipped={flipped} onFlip={handleFlip} accentColor={deckColor} />

      {!flipped ? (
        <Button size="lg" onClick={handleFlip} className="w-full">
          {t("flip")}
        </Button>
      ) : (
        <ReviewButtons card={card} onReview={handleReview} />
      )}
    </div>
  );
}
