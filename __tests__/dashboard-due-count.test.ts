import { describe, it, expect } from "vitest";

// Replicate the dueCount logic from app/[locale]/dashboard/page.tsx
// A card is "to review" if:
//   - it has a due review (cardReviews.length > 0, already filtered by due <= now), OR
//   - it has never been reviewed (_count.cardReviews === 0)
// Suspended cards are excluded from the query (where: { suspended: false })

interface MockCard {
  suspended: boolean;
  cardReviews: { id: string }[];    // filtered: due <= now
  _count: { cardReviews: number };  // total reviews for this user
}

function computeDueCount(cards: MockCard[]): number {
  return cards.filter(
    (c) => c.cardReviews.length > 0 || c._count.cardReviews === 0
  ).length;
}

describe("dashboard dueCount logic", () => {
  it("counts cards with a due review", () => {
    const cards: MockCard[] = [
      { suspended: false, cardReviews: [{ id: "r1" }], _count: { cardReviews: 1 } },
      { suspended: false, cardReviews: [], _count: { cardReviews: 1 } }, // reviewed, not due
    ];
    expect(computeDueCount(cards)).toBe(1);
  });

  it("counts new cards (never reviewed)", () => {
    const cards: MockCard[] = [
      { suspended: false, cardReviews: [], _count: { cardReviews: 0 } }, // new
      { suspended: false, cardReviews: [], _count: { cardReviews: 0 } }, // new
    ];
    expect(computeDueCount(cards)).toBe(2);
  });

  it("counts both due cards and new cards", () => {
    const cards: MockCard[] = [
      { suspended: false, cardReviews: [{ id: "r1" }], _count: { cardReviews: 1 } }, // due
      { suspended: false, cardReviews: [], _count: { cardReviews: 0 } },              // new
      { suspended: false, cardReviews: [], _count: { cardReviews: 1 } },              // reviewed, not yet due
    ];
    expect(computeDueCount(cards)).toBe(2);
  });

  it("returns 0 when all cards are reviewed and not yet due", () => {
    const cards: MockCard[] = [
      { suspended: false, cardReviews: [], _count: { cardReviews: 1 } },
      { suspended: false, cardReviews: [], _count: { cardReviews: 3 } },
    ];
    expect(computeDueCount(cards)).toBe(0);
  });

  it("returns 0 for empty deck", () => {
    expect(computeDueCount([])).toBe(0);
  });

  it("counts all cards in a brand new deck", () => {
    const cards: MockCard[] = Array.from({ length: 18 }, () => ({
      suspended: false,
      cardReviews: [],
      _count: { cardReviews: 0 },
    }));
    expect(computeDueCount(cards)).toBe(18);
  });

  it("counts correctly with a mixed deck mid-session", () => {
    // 2 done (reviewed, not due), 3 due, 5 new
    const cards: MockCard[] = [
      ...Array.from({ length: 2 }, () => ({
        suspended: false, cardReviews: [], _count: { cardReviews: 1 },
      })),
      ...Array.from({ length: 3 }, () => ({
        suspended: false, cardReviews: [{ id: "r" }], _count: { cardReviews: 1 },
      })),
      ...Array.from({ length: 5 }, () => ({
        suspended: false, cardReviews: [], _count: { cardReviews: 0 },
      })),
    ];
    expect(computeDueCount(cards)).toBe(8); // 3 due + 5 new
  });
});
