"use client";

import { RichEditor } from "@/components/editor/RichEditor";
import type { StudyCard as StudyCardType } from "@/types";

interface StudyCardProps {
  card: StudyCardType;
  flipped: boolean;
  onFlip: () => void;
  accentColor: string;
}

export function StudyCard({ card, flipped, onFlip, accentColor }: StudyCardProps) {
  return (
    <div
      className="relative w-full min-h-64 cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={!flipped ? onFlip : undefined}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 border rounded-xl p-6 flex flex-col justify-center bg-card shadow-sm"
          style={{ backfaceVisibility: "hidden", borderTopColor: accentColor, borderTopWidth: 3 }}
        >
          <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Front
          </div>
          <RichEditor content={card.front} editable={false} />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 border rounded-xl p-6 flex flex-col justify-center bg-card shadow-sm"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            borderTopColor: accentColor,
            borderTopWidth: 3,
          }}
        >
          <div className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            Back
          </div>
          <RichEditor content={card.back} editable={false} />
        </div>
      </div>
    </div>
  );
}
