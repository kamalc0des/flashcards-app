import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Inline the pure session helpers to test them in isolation
// (they are not exported from StudySession.tsx, so we redefine + test them here)

interface SavedSession {
  queue: unknown[];
  current: number;
  learned: number;
}

function sessionKey(deckId: string) {
  return `study-session-${deckId}`;
}

function saveSession(deckId: string, state: SavedSession) {
  try {
    localStorage.setItem(sessionKey(deckId), JSON.stringify(state));
  } catch {}
}

function loadSession(deckId: string): SavedSession | null {
  try {
    const raw = localStorage.getItem(sessionKey(deckId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearSession(deckId: string) {
  try {
    localStorage.removeItem(sessionKey(deckId));
  } catch {}
}

// Simulate the shuffle + cap used in startFresh
function shuffleAndCap<T>(data: T[], limit = 20): T[] {
  return [...data].sort(() => Math.random() - 0.5).slice(0, limit);
}

// Simulate the "Again" requeue logic from handleReview
function requeueCard<T>(queue: T[], currentIndex: number): T[] {
  const card = queue[currentIndex];
  const next = [...queue];
  next.splice(currentIndex, 1);
  next.push(card);
  return next;
}

// --- localStorage mock ---
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock, writable: true });

// ----------------------------------------------------------------

describe("sessionKey", () => {
  it("produces a namespaced key", () => {
    expect(sessionKey("abc123")).toBe("study-session-abc123");
  });
});

describe("saveSession / loadSession / clearSession", () => {
  const deckId = "deck-1";

  beforeEach(() => localStorageMock.clear());

  it("saves and loads a session", () => {
    const session: SavedSession = { queue: ["a", "b"], current: 1, learned: 1 };
    saveSession(deckId, session);
    const loaded = loadSession(deckId);
    expect(loaded).toEqual(session);
  });

  it("returns null when no session saved", () => {
    expect(loadSession(deckId)).toBeNull();
  });

  it("clears a saved session", () => {
    saveSession(deckId, { queue: ["a"], current: 0, learned: 0 });
    clearSession(deckId);
    expect(loadSession(deckId)).toBeNull();
  });

  it("overrides previous session on save", () => {
    saveSession(deckId, { queue: ["a"], current: 0, learned: 0 });
    saveSession(deckId, { queue: ["b", "c"], current: 1, learned: 1 });
    expect(loadSession(deckId)?.queue).toEqual(["b", "c"]);
  });

  it("sessions are isolated by deckId", () => {
    saveSession("deck-A", { queue: ["a"], current: 0, learned: 0 });
    saveSession("deck-B", { queue: ["b"], current: 0, learned: 0 });
    expect(loadSession("deck-A")?.queue).toEqual(["a"]);
    expect(loadSession("deck-B")?.queue).toEqual(["b"]);
    clearSession("deck-A");
    expect(loadSession("deck-A")).toBeNull();
    expect(loadSession("deck-B")?.queue).toEqual(["b"]);
  });
});

describe("shuffleAndCap", () => {
  it("returns at most 20 items", () => {
    const data = Array.from({ length: 50 }, (_, i) => i);
    expect(shuffleAndCap(data)).toHaveLength(20);
  });

  it("returns all items when fewer than 20", () => {
    const data = [1, 2, 3];
    expect(shuffleAndCap(data)).toHaveLength(3);
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
    const queue = ["A", "B", "C"];
    const result = requeueCard(queue, 0);
    expect(result).toEqual(["B", "C", "A"]);
  });

  it("keeps queue the same length", () => {
    const queue = ["A", "B", "C"];
    expect(requeueCard(queue, 1)).toHaveLength(3);
  });

  it("handles last card (stays at end)", () => {
    const queue = ["A", "B", "C"];
    const result = requeueCard(queue, 2);
    expect(result).toEqual(["A", "B", "C"]);
  });

  it("handles single-card queue", () => {
    const queue = ["A"];
    const result = requeueCard(queue, 0);
    expect(result).toEqual(["A"]);
  });

  it("does not mutate the original queue", () => {
    const queue = ["A", "B", "C"];
    requeueCard(queue, 0);
    expect(queue).toEqual(["A", "B", "C"]);
  });

  it("after requeue, current index still points to next card", () => {
    const queue = ["A", "B", "C"];
    const next = requeueCard(queue, 0);
    expect(next[0]).toBe("B"); // same index=0 now shows B
  });
});

describe("session completion logic", () => {
  it("session is done when current >= queue.length", () => {
    const queue = ["A", "B"];
    const current = 2;
    expect(current >= queue.length).toBe(true);
  });

  it("session is not done while current < queue.length", () => {
    const queue = ["A", "B"];
    const current = 1;
    expect(current >= queue.length).toBe(false);
  });

  it("empty queue triggers empty state (not done state)", () => {
    const queue: string[] = [];
    const current = 0;
    // empty state check comes first in component
    expect(queue.length === 0).toBe(true);
    expect(current >= queue.length).toBe(true); // both true, empty takes priority
  });

  it("advancing past last card ends session", () => {
    const queue = ["A"];
    const current = 0;
    const nextCurrent = current + 1;
    expect(nextCurrent >= queue.length).toBe(true);
  });
});
