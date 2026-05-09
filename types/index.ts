import type { JSONContent } from "@tiptap/react";

export interface DeckSummary {
  id: string;
  name: string;
  description: string | null;
  color: string;
  createdAt: string;
  cardCount: number;
}

export interface DeckDetail extends DeckSummary {
  cards: CardSummary[];
}

export interface CardSummary {
  id: string;
  front: JSONContent;
  back: JSONContent;
  createdAt: string;
}

export interface StudyCard {
  id: string;
  front: JSONContent;
  back: JSONContent;
  review: {
    ease: number;
    interval: number;
    reps: number;
    lapses: number;
    due: string;
  } | null;
}
