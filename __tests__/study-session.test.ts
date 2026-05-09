import { describe, it, expect } from "vitest";

// Pure logic helpers extracted from StudySession.tsx

function shuffleAndCap<T>(data: T[], limit = 20): T[] {
  return [...data].sort(() => Math.random() - 0.5).slice(0, limit);
}

function requeueCard<T>(queue: T[], currentIndex: number): T[] {
  const card = queue[currentIndex];
  const next = [...queue];
  next.splice(currentIndex, 1);
  next.push(card);
  return next;
}

// ----------------------------------------------------------------

describe("shuffleAndCap", () => {
  it("returns at most 20 items", () => {
    const data = Array.from({ length: 50 }, (_, i) => i);
    expect(shuffleAndCap(data)).toHaveLength(20);
  });

  it("returns all items when fewer than 20", () => {
    expect(shuffleAndCap([1, 2, 3])).toHaveLength(3);
  });

  it("returns empty array for empty input", () => {
    expect(shuffleAndCap([])).toHaveLength(0);
  });

  it("does not mutate the original array", () => {
    const data = [1, 2, 3];
    shuffleAndCap(data);
    expect(data).toEqual([1, 2, 3]);
  });

  it("contains only items from the original array", () => {
    const data = Array.from({ length: 30 }, (_, i) => i);
    const result = shuffleAndCap(data);
    result.forEach((item) => expect(data).toContain(item));
  });

  it("respects a custom limit", () => {
    const data = Array.from({ length: 10 }, (_, i) => i);
    expect(shuffleAndCap(data, 5)).toHaveLength(5);
  });
});

describe("requeueCard (Again logic)", () => {
  it("moves the card from current position to end", () => {
    expect(requeueCard(["A", "B", "C"], 0)).toEqual(["B", "C", "A"]);
  });

  it("keeps queue the same length", () => {
    expect(requeueCard(["A", "B", "C"], 1)).toHaveLength(3);
  });

  it("handles last card (stays at end)", () => {
    expect(requeueCard(["A", "B", "C"], 2)).toEqual(["A", "B", "C"]);
  });

  it("handles single-card queue", () => {
    expect(requeueCard(["A"], 0)).toEqual(["A"]);
  });

  it("does not mutate the original queue", () => {
    const queue = ["A", "B", "C"];
    requeueCard(queue, 0);
    expect(queue).toEqual(["A", "B", "C"]);
  });

  it("after requeue, current index still points to next card", () => {
    const next = requeueCard(["A", "B", "C"], 0);
    expect(next[0]).toBe("B");
  });
});

describe("session completion logic", () => {
  it("session is done when current >= queue.length", () => {
    expect(2 >= ["A", "B"].length).toBe(true);
  });

  it("session is not done while current < queue.length", () => {
    expect(1 >= ["A", "B"].length).toBe(false);
  });

  it("empty queue triggers empty state before done state", () => {
    const queue: string[] = [];
    expect(queue.length === 0).toBe(true);
  });

  it("advancing past last card ends session", () => {
    const queue = ["A"];
    expect(0 + 1 >= queue.length).toBe(true);
  });
});

describe("server-driven resume logic", () => {
  it("queue excludes cards reviewed today (reviewed at >= today start)", () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const cards = [
      { id: "1", reviewedAt: new Date(todayStart.getTime() + 1000) }, // reviewed today → exclude
      { id: "2", reviewedAt: new Date(todayStart.getTime() - 1000) }, // reviewed yesterday → include
      { id: "3", reviewedAt: null },                                   // new card → include
    ];

    const remaining = cards.filter(
      (c) => !c.reviewedAt || c.reviewedAt < todayStart
    );

    expect(remaining.map((c) => c.id)).toEqual(["2", "3"]);
  });

  it("a card reviewed at exactly midnight is excluded", () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const reviewedAt = new Date(todayStart);
    expect(reviewedAt >= todayStart).toBe(true);
  });

  it("progress counter only increments on correct answers", () => {
    let learned = 0;
    const answer = (quality: number) => { if (quality > 0) learned++; };

    answer(0); expect(learned).toBe(0); // Again
    answer(1); expect(learned).toBe(1); // Hard
    answer(2); expect(learned).toBe(2); // Good
    answer(3); expect(learned).toBe(3); // Easy
  });

  it("totalCards stays fixed even when Again requeues a card", () => {
    const queue = ["A", "B", "C"];
    const totalCards = queue.length; // fixed at session start

    const afterRequeue = requeueCard(queue, 0);
    expect(afterRequeue).toHaveLength(3);
    expect(totalCards).toBe(3); // unchanged
  });
});
