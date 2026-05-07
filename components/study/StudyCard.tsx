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
      className="relative w-full flex-1 cursor-pointer"
      style={{ perspective: "1400px", minHeight: "280px" }}
      onClick={!flipped ? onFlip : undefined}
    >
      <div
        className="absolute inset-0 transition-all duration-300"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 rounded-2xl border border-zinc-800 bg-zinc-900 flex flex-col"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Question</span>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center px-6 pb-6 text-center gap-4">
            <div className="w-full">
              <RichEditor content={card.front} editable={false} />
            </div>
            <span className="text-xs text-zinc-600 flex items-center gap-1.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Tap to reveal
            </span>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded-2xl border border-zinc-700/60 bg-zinc-900 flex flex-col"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="flex items-center px-5 pt-4 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Question</span>
          </div>
          <div className="px-5 pb-3 text-zinc-400 text-sm border-b border-zinc-800">
            <RichEditor content={card.front} editable={false} />
          </div>
          <div className="flex items-center px-5 pt-3 pb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Answer</span>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-5 min-h-0">
            <RichEditor content={card.back} editable={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
